import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IndexedDbCacheService } from '@app/services/indexed-db-cache.service';
import { NetworkService } from '@app/services/network.service';
import { NotificationService } from '@app/services/notification.service';
import { PerformanceMetricsService } from '@app/services/performance-metrics.service';
import { IncomingWsMessage, MetricPoint, WebSocketMessageType } from '@app/shared/types';
import { createPerformanceMetricsFake } from '@app/testing/performance-metrics.fake';
import { Subject } from 'rxjs';
import { MetricsService } from './metrics.service';

function metricPoint(overrides: Partial<MetricPoint> = {}): MetricPoint {
  return { service: 'api', name: 'requests', granularity: 'minute', bucket: 1_000_000, value: 1, ...overrides };
}

function setup() {
  const wsMessages$ = new Subject<IncomingWsMessage>();
  const isConnected$$ = signal(false);
  const networkServiceFake: Pick<NetworkService, 'wsMessages$' | 'isConnected$$' | 'sendMessage'> = {
    wsMessages$,
    isConnected$$,
    sendMessage: vi.fn(() => true),
  };
  const notificationServiceFake: Pick<NotificationService, 'addNotification' | 'removeNotification'> = {
    addNotification: vi.fn(() => 'notification-id'),
    removeNotification: vi.fn(),
  };
  const indexedDbCacheFake: Pick<IndexedDbCacheService, 'get' | 'set' | 'remove'> = {
    get: vi.fn(() => Promise.resolve(null)),
    set: vi.fn(() => Promise.resolve()),
    remove: vi.fn(() => Promise.resolve()),
  };

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: NetworkService, useValue: networkServiceFake },
      { provide: NotificationService, useValue: notificationServiceFake },
      { provide: IndexedDbCacheService, useValue: indexedDbCacheFake },
      { provide: PerformanceMetricsService, useValue: createPerformanceMetricsFake() },
    ],
  });

  return {
    service: TestBed.inject(MetricsService),
    httpMock: TestBed.inject(HttpTestingController),
    wsMessages$,
    isConnected$$,
    appRef: TestBed.inject(ApplicationRef),
  };
}

// Lets the constructor's async IndexedDB cache-load .then() run (isCacheLoaded
// becomes true) before a test drives the connection/scope signals — the
// heartbeat only starts once the cache load has settled.
async function flushCacheLoad(): Promise<void> {
  await Promise.resolve();
}

function pushUpdate(wsMessages$: Subject<IncomingWsMessage>, points: MetricPoint[]): void {
  wsMessages$.next({ type: WebSocketMessageType.METRICS_UPDATE, payload: { points } });
}

describe('MetricsService — point dedup (pointKey/insertPoint)', () => {
  it('keeps only the latest value for points sharing the same service/name/granularity/bucket key', () => {
    const { service, wsMessages$ } = setup();
    pushUpdate(wsMessages$, [metricPoint({ value: 10 })]);
    pushUpdate(wsMessages$, [metricPoint({ value: 20 })]);
    expect(service.points$$()).toEqual([metricPoint({ value: 20 })]);
  });

  it('drops a point with a non-finite value or an unrecognized granularity instead of throwing', () => {
    const { service, wsMessages$ } = setup();
    pushUpdate(wsMessages$, [
      metricPoint({ value: NaN }),
      { ...metricPoint({ name: 'errors' }), granularity: 'century' as never },
    ]);
    expect(service.points$$()).toEqual([]);
  });
});

describe('MetricsService — pruning (prunePoints)', () => {
  it('drops points older than the granularity cache window once a newer bucket for that granularity arrives', () => {
    const { service, wsMessages$ } = setup();
    const oldPoint = metricPoint({ bucket: 1_000_000 });
    const newPoint = metricPoint({ name: 'errors', bucket: 1_000_000 + 200_000 }); // 200_000s > 172_800s (48h minute window)
    pushUpdate(wsMessages$, [oldPoint, newPoint]);
    expect(service.points$$()).toEqual([newPoint]);
  });
});

describe('MetricsService.forceRefresh — mergeHistories', () => {
  it('flattens a history response into points and applies the same dedup rules', () => {
    const { service, httpMock } = setup();
    service.setScope([{ service: 'api', metricNames: ['requests'] }]);
    service.forceRefresh();

    const req = httpMock.expectOne((r) => r.url === '/api/metrics/history' && r.method === 'POST');
    req.flush({
      histories: [
        {
          service: 'api',
          snapshots: [{ granularity: 'minute', bucket: 1_000_000, metrics: { requests: 42 } }],
        },
      ],
    });

    expect(service.points$$()).toEqual([metricPoint({ bucket: 1_000_000, value: 42 })]);
    httpMock.verify();
  });

  it('does nothing without a scope — no view has charts open, nothing to fetch', () => {
    const { service, httpMock } = setup();
    service.forceRefresh();
    httpMock.expectNone('/api/metrics/history');
  });

  it('sends the current scope in the request body', () => {
    const { service, httpMock } = setup();
    service.setScope([{ service: 'api', metricNames: ['requests'] }]);
    service.forceRefresh();

    const req = httpMock.expectOne((r) => r.url === '/api/metrics/history');
    expect(req.request.body.scope).toEqual([{ service: 'api', metricNames: ['requests'] }]);
    req.flush({ histories: [] });
  });
});

describe('MetricsService — history heartbeat (subscriptionEffect/syncHistoryHeartbeat)', () => {
  it('fires an immediate history request as soon as connected with a scope, without waiting for the interval', async () => {
    const { service, httpMock, isConnected$$, appRef } = setup();
    await flushCacheLoad();
    service.setScope([{ service: 'api', metricNames: ['requests'] }]);
    isConnected$$.set(true);
    appRef.tick();

    const req = httpMock.expectOne((r) => r.url === '/api/metrics/history');
    req.flush({ histories: [] });
    httpMock.verify();
  });

  it('fires a fresh immediate request on every scope change, not just on first activation', async () => {
    const { service, httpMock, isConnected$$, appRef } = setup();
    await flushCacheLoad();
    service.setScope([{ service: 'api', metricNames: ['requests'] }]);
    isConnected$$.set(true);
    appRef.tick();
    httpMock.expectOne((r) => r.url === '/api/metrics/history').flush({ histories: [] });

    // The heartbeat interval is already running at this point — before the fix, the
    // "already running" guard also blocked this immediate check, so switching services
    // would silently wait up to a full interval period instead of fetching right away.
    service.setScope([{ service: 'other', metricNames: ['errors'] }]);
    appRef.tick();

    const secondRequest = httpMock.expectOne((r) => r.url === '/api/metrics/history');
    expect(secondRequest.request.body.scope).toEqual([{ service: 'other', metricNames: ['errors'] }]);
    secondRequest.flush({ histories: [] });
    httpMock.verify();
  });

  it('does not drop a scope change that arrives while a request is in flight — a follow-up request picks up the new scope once the first settles', async () => {
    const { service, httpMock, isConnected$$, appRef } = setup();
    await flushCacheLoad();
    service.setScope([{ service: 'api', metricNames: ['requests'] }]);
    isConnected$$.set(true);
    appRef.tick();
    const firstRequest = httpMock.expectOne((r) => r.url === '/api/metrics/history');

    // Scope changes again before the first request resolves — must not be lost.
    service.setScope([{ service: 'other', metricNames: ['errors'] }]);
    appRef.tick();
    httpMock.expectNone('/api/metrics/history');

    firstRequest.flush({ histories: [] });

    const secondRequest = httpMock.expectOne((r) => r.url === '/api/metrics/history');
    expect(secondRequest.request.body.scope).toEqual([{ service: 'other', metricNames: ['errors'] }]);
    secondRequest.flush({ histories: [] });
    httpMock.verify();
  });
});
