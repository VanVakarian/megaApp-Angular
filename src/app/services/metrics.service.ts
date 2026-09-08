import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { IndexedDbCacheService } from '@app/services/indexed-db-cache.service';
import { NetworkService } from '@app/services/network.service';
import { NotificationService } from '@app/services/notification.service';
import { PerformanceMetricsService } from '@app/services/performance-metrics.service';
import {
  METRIC_GRANULARITIES,
  MetricsCursorMap,
  MetricsHistoryWatermarks,
  emptyMetricsCursorMap,
  emptyMetricsHistoryWatermarks,
  latestClosedHistoryBucket,
  metricCursorKey,
  nextHistorySinceBucket,
  parseMetricsCursorMap,
} from '@app/shared/metrics-history-range';
import {
  MetricGranularity,
  MetricPoint,
  MetricsHistoryResponse,
  MetricsScopeEntry,
  WebSocketMessageType,
} from '@app/shared/types';

const STORAGE_KEY = 'metrics_detail';
const CACHE_WINDOW_SECONDS: Record<MetricGranularity, number> = {
  minute: 48 * 60 * 60,
  hour: 30 * 24 * 60 * 60,
  day: 365 * 24 * 60 * 60,
};
const CACHE_WRITE_DELAY_MS = 1_000;
const HISTORY_HEARTBEAT_INTERVAL_MS = 60_000;
const REFRESH_RETRY_DELAY_MS = 60_000;

interface MetricsCacheState {
  points: MetricPoint[];
  historyCheckedThrough: MetricsCursorMap;
}

interface MetricsHistoryRequestBody {
  minuteSince: number;
  hourSince: number;
  daySince: number;
  scope: MetricsScopeEntry[];
}

interface MetricsHistoryRequest {
  since: MetricsHistoryWatermarks;
  targets: MetricsHistoryWatermarks;
  scope: MetricsScopeEntry[];
}

@Injectable({
  providedIn: 'root',
})
export class MetricsService {
  public readonly points$$ = signal<MetricPoint[]>([]);
  public readonly isRefreshing$$ = signal(false);

  // null = no view with charts open right now (e.g. Settings, or nothing has
  // mounted yet). Replaced wholesale on every view change, never merged — see
  // plans/32-metrics-mobile-custom-only-mode.implementation-plan.md §4.5.
  private readonly currentScope$$ = signal<MetricsScopeEntry[] | null>(null);

  private readonly networkService = inject(NetworkService);
  private readonly notificationService = inject(NotificationService);
  private readonly http = inject(HttpClient);
  private readonly indexedDbCache = inject(IndexedDbCacheService);
  private readonly performanceMetrics = inject(PerformanceMetricsService);
  private readonly pointsByKey = new Map<string, MetricPoint>();
  private readonly latestBuckets = emptyMetricsHistoryWatermarks();

  private isCacheLoaded = false;
  private latestRealtimeMinuteBucket = 0;
  private historyCheckedThrough = emptyMetricsCursorMap();
  private retryAfterMs = 0;
  private hasNotifiedHistoryError = false;
  private hasPendingHistoryRefresh = false;
  private cacheWriteTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private historyHeartbeatIntervalId: ReturnType<typeof setInterval> | null = null;
  private pendingRefreshNotificationId: string | null = null;

  // Single reactive source of truth for both the WS subscription and the REST
  // history heartbeat — reacts to connection state and scope together, so
  // first load, reconnect and view switches all go through this one path
  // instead of separate imperative call sites. See §4.5 and the "Рефакторинг
  // после ревью" section of the plan referenced above for the full scenario
  // table and the reasoning behind folding the heartbeat in here too.
  private readonly subscriptionEffect = effect(() => {
    const isConnected = this.networkService.isConnected$$();
    const scope = this.currentScope$$();
    untracked(() => {
      if (!isConnected) {
        this.syncHistoryHeartbeat(false);
        return;
      }
      if (scope) {
        this.networkService.sendMessage({ type: WebSocketMessageType.METRICS_SUBSCRIBE, payload: { scope } });
        this.syncHistoryHeartbeat(true);
      } else {
        this.networkService.sendMessage({ type: WebSocketMessageType.METRICS_UNSUBSCRIBE });
        this.syncHistoryHeartbeat(false);
      }
    });
  });

  constructor() {
    const cacheStartedAt = performance.now();
    void this.indexedDbCache.get<MetricsCacheState | MetricPoint[]>(STORAGE_KEY).then((cached) => {
      if (Array.isArray(cached)) {
        this.mergePoints(cached, false, false);
      } else if (cached) {
        this.mergePoints(cached.points ?? [], false, false);
        this.historyCheckedThrough = parseMetricsCursorMap(cached.historyCheckedThrough);
      }
      this.isCacheLoaded = true;
      this.syncHistoryHeartbeat(this.currentScope$$() !== null && this.networkService.isConnected$$());
      this.performanceMetrics.record('metrics.cache_hydrate', performance.now() - cacheStartedAt, {
        cache: cached ? 'hit' : 'miss',
        points: this.pointsByKey.size,
      });
    });

    this.networkService.wsMessages$.subscribe((message) => {
      if (message.type === WebSocketMessageType.METRICS_UPDATE) {
        this.performanceMetrics.measure(
          'metrics.realtime_batch',
          () => this.mergePoints(message.payload.points, true),
          () => ({
            inputPoints: message.payload.points.length,
            retainedPoints: this.pointsByKey.size,
          }),
        );
        return;
      }
      if (message.type === WebSocketMessageType.METRICS_LATEST) {
        for (const service of message.payload.services) {
          if (Number.isFinite(service.lastBucket)) {
            this.latestRealtimeMinuteBucket = Math.max(this.latestRealtimeMinuteBucket, service.lastBucket);
          }
        }
      }
    });
  }

  // Called whenever the open view's set of visible metrics changes (view
  // switch, dashboard selection edit, first mount). Empty scope means "no
  // charts on screen" and is normalized to null (unsubscribed), same as never
  // having set one.
  public setScope(scope: MetricsScopeEntry[]): void {
    this.currentScope$$.set(scope.length > 0 ? scope : null);
  }

  // Leaving the /metrics route entirely — distinct from switching views while
  // still on it, which goes through setScope() instead. Stops the heartbeat
  // immediately rather than waiting for the effect's async reaction to the
  // scope write below — same defensive-immediacy reasoning as before.
  public unsubscribe(): void {
    this.currentScope$$.set(null);
    this.syncHistoryHeartbeat(false);
  }

  public forceRefresh(): void {
    this.refreshHistory(true);
  }

  public clearCache(): void {
    this.pointsByKey.clear();
    for (const granularity of METRIC_GRANULARITIES) {
      this.latestBuckets[granularity] = 0;
    }
    this.historyCheckedThrough = emptyMetricsCursorMap();
    this.points$$.set([]);
    if (this.cacheWriteTimeoutId !== null) {
      clearTimeout(this.cacheWriteTimeoutId);
      this.cacheWriteTimeoutId = null;
    }
    void this.indexedDbCache.remove(STORAGE_KEY);
    this.refreshHistory();
  }

  private refreshHistory(showNotification = false): void {
    if (this.isRefreshing$$()) {
      // A view/service switch (or another automatic trigger) landed while a
      // request for the previous scope was still in flight — don't drop it,
      // note it and re-check once that request settles (consumePendingHistoryRefresh),
      // instead of leaving the new scope stale until the next heartbeat tick.
      if (!showNotification) this.hasPendingHistoryRefresh = true;
      return;
    }
    // Automatic path only — a manual click should never be blocked by a
    // backoff set from an earlier automatic failure.
    if (!showNotification && Date.now() < this.retryAfterMs) return;

    const scope = this.currentScope$$();
    if (!scope) return;

    const request = this.buildHistoryRequest(scope, showNotification);
    if (!request) return;

    this.isRefreshing$$.set(true);
    if (showNotification) {
      this.retryAfterMs = 0;
      // Shown immediately, not after the usual pending-feedback delay (see SyncEngineService) —
      // that delay exists to skip the flash for requests that usually resolve fast, but a manual
      // history refresh is known to be slow, so the spinner should show right away.
      this.pendingRefreshNotificationId = this.notificationService.addNotification('warning', 'Refreshing metrics…', {
        persistent: true,
      });
    }

    const body: MetricsHistoryRequestBody = {
      minuteSince: request.since.minute,
      hourSince: request.since.hour,
      daySince: request.since.day,
      scope: request.scope,
    };

    const startedAt = performance.now();
    this.http.post<MetricsHistoryResponse>('/api/metrics/history', body).subscribe({
      next: (response) => {
        const histories = response.histories ?? [];
        this.mergeHistories(histories);
        // Advance every metric the request named, not only ones that appeared in the
        // response — Flatline's response is authoritative for the whole requested
        // range, so a metric absent from it genuinely had no points there, not "we
        // didn't check". See §4.3 of the plan referenced above (safety condition).
        for (const entry of request.scope) {
          for (const name of entry.metricNames) {
            const key = metricCursorKey(entry.service, name);
            const cursor = this.historyCheckedThrough[key] ?? emptyMetricsHistoryWatermarks();
            const next = { ...cursor };
            for (const granularity of METRIC_GRANULARITIES) {
              next[granularity] = Math.max(next[granularity], request.targets[granularity]);
            }
            this.historyCheckedThrough[key] = next;
          }
        }
        this.retryAfterMs = 0;
        this.hasNotifiedHistoryError = false;
        this.isRefreshing$$.set(false);
        this.scheduleCacheWrite();
        void this.performanceMetrics.recordAfterPaint('metrics.history_refresh', startedAt, {
          trigger: showNotification ? 'manual' : 'automatic',
          histories: histories.length,
          retainedPoints: this.pointsByKey.size,
        });
        if (showNotification) {
          this.resolvePendingRefreshNotification();
          this.notificationService.addNotification('success', 'Metrics refreshed');
        }
        this.consumePendingHistoryRefresh();
      },
      error: (error: HttpErrorResponse) => {
        this.retryAfterMs = Date.now() + REFRESH_RETRY_DELAY_MS;
        this.isRefreshing$$.set(false);
        if (showNotification) {
          this.resolvePendingRefreshNotification();
          this.notificationService.addNotification('error', 'Failed to refresh metrics');
        } else if (error.status >= 400 && error.status < 500 && !this.hasNotifiedHistoryError) {
          // A 4xx is a client/config problem, not a transient blip — worth telling the
          // user about once per failure streak, unlike a 5xx/network error which keeps
          // retrying silently on the next heartbeat tick (see plan §"Рефакторинг после
          // ревью", находка 3).
          this.hasNotifiedHistoryError = true;
          this.notificationService.addNotification('error', 'Failed to refresh metrics');
        }
        this.performanceMetrics.record(
          'metrics.history_refresh',
          performance.now() - startedAt,
          {
            trigger: showNotification ? 'manual' : 'automatic',
          },
          'error',
        );
        this.consumePendingHistoryRefresh();
      },
    });
  }

  // A refresh requested while the previous one was still in flight
  // (refreshHistory's isRefreshing$$ guard) gets exactly one follow-up
  // attempt right after that one settles — it will read whatever scope is
  // current at that point, so a rapid A→B→C switch still ends up fetching
  // for C, not stuck showing B's data until the next heartbeat tick.
  private consumePendingHistoryRefresh(): void {
    if (!this.hasPendingHistoryRefresh) return;
    this.hasPendingHistoryRefresh = false;
    this.refreshHistory();
  }

  private mergeHistories(histories: MetricsHistoryResponse['histories']): void {
    for (const history of histories) {
      const service = history?.service?.trim();
      if (!service) continue;
      for (const snapshot of history.snapshots ?? []) {
        if (!this.isValidGranularity(snapshot?.granularity) || !Number.isFinite(snapshot.bucket)) continue;
        for (const [name, value] of Object.entries(snapshot.metrics ?? {})) {
          this.insertPoint({ service, name, granularity: snapshot.granularity, bucket: snapshot.bucket, value }, false);
        }
      }
    }
    this.prunePoints();
    this.publishPoints(true);
  }

  private mergePoints(newPoints: MetricPoint[] | null, isRealtime: boolean, shouldSave = true): void {
    if (!newPoints || newPoints.length === 0) return;

    for (const point of newPoints) {
      this.insertPoint(point, isRealtime);
    }
    this.prunePoints();
    this.publishPoints(shouldSave);
  }

  private insertPoint(point: MetricPoint, isRealtime: boolean): void {
    if (
      !point?.service ||
      !point.name ||
      !this.isValidGranularity(point.granularity) ||
      !Number.isFinite(point.bucket) ||
      !Number.isFinite(point.value)
    ) {
      return;
    }

    const key = this.pointKey(point);
    this.pointsByKey.set(key, point);
    this.latestBuckets[point.granularity] = Math.max(this.latestBuckets[point.granularity], point.bucket);

    if (point.granularity === 'minute') {
      if (isRealtime) {
        this.latestRealtimeMinuteBucket = Math.max(this.latestRealtimeMinuteBucket, point.bucket);
      }
    }
  }

  private prunePoints(): void {
    for (const [key, point] of this.pointsByKey) {
      const minBucket = this.latestBuckets[point.granularity] - CACHE_WINDOW_SECONDS[point.granularity];
      if (minBucket <= 0 || point.bucket >= minBucket) continue;
      this.pointsByKey.delete(key);
    }
  }

  private publishPoints(shouldSave: boolean): void {
    const points = Array.from(this.pointsByKey.values()).sort((a, b) => {
      if (a.bucket !== b.bucket) return a.bucket - b.bucket;
      if (a.service !== b.service) return a.service.localeCompare(b.service);
      return a.name.localeCompare(b.name);
    });
    this.points$$.set(points);
    if (shouldSave) {
      this.scheduleCacheWrite();
    }
  }

  // One heartbeat, one owner (subscriptionEffect) — replaces the old
  // self-rescheduling setTimeout chain, which quietly died the moment a tick
  // found nothing to do or hit an error, with no way back short of a scope
  // change or reconnect. A plain interval can't die like that: every tick
  // calls refreshHistory(), which is already a safe no-op when there's
  // nothing to fetch, a refresh is in flight, or the retry backoff hasn't
  // elapsed yet.
  //
  // Two separate concerns live here, deliberately not merged into one guard:
  // "is the interval running" (idempotent — created once, torn down once) and
  // "check now" (must happen every single time this is called with
  // active=true, since every call means something just changed — first mount,
  // reconnect, or a view/service switch — and each of those deserves its own
  // immediate check rather than waiting up to HISTORY_HEARTBEAT_INTERVAL_MS
  // for the next tick). refreshHistory() itself is what makes calling it
  // "for free" safe to do this often — see needsRefresh in buildHistoryRequest.
  private syncHistoryHeartbeat(active: boolean): void {
    const shouldRun = active && this.isCacheLoaded;
    if (!shouldRun) {
      if (this.historyHeartbeatIntervalId !== null) {
        clearInterval(this.historyHeartbeatIntervalId);
        this.historyHeartbeatIntervalId = null;
      }
      return;
    }
    this.refreshHistory();
    if (this.historyHeartbeatIntervalId === null) {
      this.historyHeartbeatIntervalId = setInterval(() => this.refreshHistory(), HISTORY_HEARTBEAT_INTERVAL_MS);
    }
  }

  // One request per call, floored per granularity by the neediest metric in
  // scope — not one request per metric. A metric already caught up just gets
  // some already-known points back (harmless, deduped by key in insertPoint),
  // never under-fetches. See §4.2-4.3 of the plan referenced above.
  private buildHistoryRequest(scope: MetricsScopeEntry[], force: boolean): MetricsHistoryRequest | null {
    const latestMinuteBucket =
      this.latestRealtimeMinuteBucket > 0 ? this.latestRealtimeMinuteBucket : Math.floor(Date.now() / 60_000) * 60 - 60;

    const since = emptyMetricsHistoryWatermarks();
    const targets = emptyMetricsHistoryWatermarks();
    for (const granularity of METRIC_GRANULARITIES) {
      const target = latestClosedHistoryBucket(granularity, latestMinuteBucket);
      targets[granularity] = target;
      // Sentinel > target: narrowed below by any metric that still needs catching up;
      // if none do, this granularity contributes nothing and stays "not needed".
      since[granularity] = target + 1;
    }

    for (const entry of scope) {
      for (const name of entry.metricNames) {
        const cursor = force ? undefined : this.historyCheckedThrough[metricCursorKey(entry.service, name)];
        for (const granularity of METRIC_GRANULARITIES) {
          const requiredSince = nextHistorySinceBucket(granularity, cursor?.[granularity] ?? 0, targets[granularity]);
          since[granularity] = Math.min(since[granularity], requiredSince);
        }
      }
    }

    const needsRefresh = METRIC_GRANULARITIES.some((granularity) => since[granularity] <= targets[granularity]);
    if (!needsRefresh) return null;
    return { since, targets, scope };
  }

  private scheduleCacheWrite(): void {
    if (this.cacheWriteTimeoutId !== null) return;
    this.cacheWriteTimeoutId = setTimeout(() => {
      this.cacheWriteTimeoutId = null;
      const startedAt = performance.now();
      void this.indexedDbCache
        .set<MetricsCacheState>(STORAGE_KEY, {
          points: this.points$$(),
          historyCheckedThrough: { ...this.historyCheckedThrough },
        })
        .then(() =>
          this.performanceMetrics.record('metrics.cache_persist', performance.now() - startedAt, {
            points: this.pointsByKey.size,
          }),
        );
    }, CACHE_WRITE_DELAY_MS);
  }

  private resolvePendingRefreshNotification(): void {
    if (this.pendingRefreshNotificationId === null) return;
    this.notificationService.removeNotification(this.pendingRefreshNotificationId);
    this.pendingRefreshNotificationId = null;
  }

  private isValidGranularity(value: unknown): value is MetricGranularity {
    return value === 'minute' || value === 'hour' || value === 'day';
  }

  private pointKey(point: MetricPoint): string {
    return `${point.granularity}:${point.service}:${point.name}:${point.bucket}`;
  }
}
