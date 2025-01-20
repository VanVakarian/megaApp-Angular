import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, effect, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

import { Stats, StatsChartData } from 'src/app/shared/interfaces';
import { formatDateTicks, getTodayIsoNoTimeNoTZ } from 'src/app/shared/utils';
import { emptyStatsChartData } from '../shared/const';

@Injectable({
  providedIn: 'root',
})
export class FoodStatsService {
  public stats$$: WritableSignal<Stats> = signal({});
  public statsChartData$$: Signal<StatsChartData> = computed(() => this.prepareChartData());

  public forceUpdateTrigger$$ = signal(0);

  public selectedDateIdxStart$$: WritableSignal<number> = signal(-1);
  public selectedDateIdxEnd$$: WritableSignal<number> = signal(Infinity);

  public StatsChartData$$: Signal<StatsChartData> = computed(() => {
    const data = this.statsChartData$$();
    const start = this.selectedDateIdxStart$$();
    const end = this.selectedDateIdxEnd$$();

    return {
      dates: data.dates.slice(start, end + 1).map(formatDateTicks),
      weights: data.weights.slice(start, end + 1),
      weightsAvg: data.weightsAvg.slice(start, end + 1),
      kcals: data.kcals.slice(start, end + 1),
      kcalsAvg: data.kcalsAvg.slice(start, end + 1),
    };
  });

  constructor(private http: HttpClient) {
    effect(() => {
      // console.log('STATS has been updated:', this.stats$$()); // prettier-ignore
      // console.log('STATS CHART DATA has been updated:', this.statsChartData$$()); // prettier-ignore
      // console.log('SELECTED DATE IDX LOW has been updated:', this.selectedDateIdxStart$$()); // prettier-ignore
      // console.log('SELECTED DATE IDX HIGH has been updated:', this.selectedDateIdxEnd$$()); // prettier-ignore
    });
  }

  public getStats(): Observable<Stats> {
    const params = new HttpParams().set('date', getTodayIsoNoTimeNoTZ());
    return this.http.get<Stats>('/api/food/stats', { params }).pipe(
      tap((statsData: Stats) => {
        this.setupInitialData(statsData);
      }),
      catchError((error) => {
        console.error('Failed fetching stats:', error);
        return of({});
      }),
    );
  }

  private setupInitialData(statsData: Stats) {
    this.stats$$.set(statsData);
    setTimeout(() => {
      this.clipDateRange(91);
    }, 0);
    setTimeout(() => {
      this.clipDateRange(90);
    }, 0);
  }

  private prepareChartData(inputData?: Stats): StatsChartData {
    const stats = this.stats$$() || inputData || {};
    const result: StatsChartData = { ...emptyStatsChartData };

    Object.entries(stats).forEach(([date, values]) => {
      const [weight, weightAvg, kcal, kcalAvg] = values;
      result.dates.push(date);
      result.weights.push(weight);
      result.weightsAvg.push(weightAvg);
      result.kcals.push(kcal);
      result.kcalsAvg.push(kcalAvg);
    });

    return result;
  }

  public clipDateRange(daysAmtToShow: number) {
    const totalDaysAvailable = this.statsChartData$$().dates.length;
    const isShowAllDays = daysAmtToShow === -1;
    const hasEnoughDaysForDisplay = totalDaysAvailable > daysAmtToShow;
    const firstDayIndex = isShowAllDays || !hasEnoughDaysForDisplay ? 0 : totalDaysAvailable - daysAmtToShow;

    this.selectedDateIdxStart$$.set(firstDayIndex);
    this.selectedDateIdxEnd$$.set(totalDaysAvailable - 1);
  }
}
