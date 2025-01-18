import { HttpClient, HttpParams } from '@angular/common/http';
import { effect, Injectable, signal, WritableSignal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

import { Stats } from 'src/app/shared/interfaces';
import { getTodayIsoNoTimeNoTZ } from 'src/app/shared/utils';

@Injectable({
  providedIn: 'root',
})
export class FoodStatsService {
  public stats$$: WritableSignal<Stats> = signal({});

  constructor(private http: HttpClient) {
    effect(() => {
      // console.log('STATS has been updated:', this.stats$$()); // prettier-ignore
    });
  }

  public getStats(): Observable<Stats> {
    const params = new HttpParams().set('date', getTodayIsoNoTimeNoTZ());
    return this.http.get<Stats>('/api/food/stats', { params }).pipe(
      tap((response: Stats) => {
        this.stats$$.set(response);
      }),
      catchError((error) => {
        console.error('Failed fetching stats:', error);
        return of({});
      }),
    );
  }
}
