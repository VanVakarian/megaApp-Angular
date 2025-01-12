import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Signal,
  ViewChild,
  WritableSignal,
  computed,
  effect,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';

import { CategoryScale, Chart, Legend, LineController, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
import { Subject, throttleTime } from 'rxjs';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Title, Tooltip, Legend);

import { FoodService } from 'src/app/services/food.service';
import {
  KCALS_CHART_SETTINGS,
  WEIGHT_CHART_SETTINGS,
  daysRuDeclentions,
  monthsRuDeclentions,
  yearsRuDeclentions,
} from 'src/app/shared/const';

@Component({
  selector: 'app-food-stats',
  templateUrl: './food-stats.component.html',
  styleUrl: './food-stats.component.scss',
  imports: [CommonModule, MatCardModule, MatSliderModule, FormsModule],
  standalone: true,
})
export class FoodStatsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('weightChartCanvas')
  public weightChartCanvas!: ElementRef;

  @ViewChild('kcalsChartCanvas')
  public kcalsChartCanvas!: ElementRef;

  public weightChart: any;
  public kcalsChart: any;

  public maxSliderValue: number = 1;

  public selectedDateIdxLow: number = 0;
  public selectedDateIdxHigh: number = 1;

  private sliderChangeLow$: Subject<number> = new Subject();
  private sliderChangeHigh$: Subject<number> = new Subject();

  public sliderLowLabelAsDateIso: string = '';
  public sliderHighLabelAsDateIso: string = '';

  private statsDates$$: Signal<string[]> = computed(() => this.getStatsDates());
  private statsWeights$$: Signal<number[]> = computed(() => this.getValuesAtSpecificPosition(0));
  private statsWeightsAvg$$: Signal<number[]> = computed(() => this.getValuesAtSpecificPosition(1));
  private statsKcals$$: Signal<number[]> = computed(() => this.getValuesAtSpecificPosition(2));
  private statsKcalsAvg$$: Signal<number[]> = computed(() => this.getValuesAtSpecificPosition(3));

  private getStatsDates() {
    return [];
    // return Object.keys(this.foodService.stats$$());
  }

  private getValuesAtSpecificPosition(position: number): number[] {
    return [];
    // return Object.entries(this.foodService.stats$$()).map(([key, value]) => value[position]);
  }

  private chartStartIdx$$: WritableSignal<number> = signal(0); // Signals here allow clipping arrays upon slider input
  private chartEndIdx$$: WritableSignal<number> = signal(1);

  public selectedRangeDescription$$: Signal<string> = computed(() => this.formatSelectedRange());

  private clippedStatsDates$$: Signal<string[]> = computed(() => this.sliceArrWithDatesProcess(this.statsDates$$));
  private clippedStatsWeights$$: Signal<string[]> = computed(() => this.sliceArr(this.statsWeights$$));
  private clippedStatsWeightsAvg$$: Signal<string[]> = computed(() => this.sliceArr(this.statsWeightsAvg$$));
  private clippedStatsKcals$$: Signal<string[]> = computed(() => this.sliceArr(this.statsKcals$$));
  private clippedStatsKcalsAvg$$: Signal<string[]> = computed(() => this.sliceArr(this.statsKcalsAvg$$));

  constructor(private foodService: FoodService) {
    this.sliderChangeLow$.pipe(throttleTime(33)).subscribe((value) => {
      this.chartStartIdx$$.set(value);
    });

    this.sliderChangeHigh$.pipe(throttleTime(33)).subscribe((value) => {
      this.chartEndIdx$$.set(value);
    });

    // effect(() => { console.log('CHART START INDEX has been updated:', this.chartStartIdx$$()); }); // prettier-ignore
    // effect(() => { console.log('CHART END INDEX array has been updated:', this.chartEndIdx$$()); }); // prettier-ignore
    // effect(() => { console.log('SELECTED RANGE DESCRIPTION string has been updated:', this.selectedRangeDescription$$()); }); // prettier-ignore
    // effect(() => { console.log('CLIPPED STATS DATES array has been updated:', this.clippedStatsDates$$()); }); // prettier-ignore
    // effect(() => { console.log('CLIPPED STATS WEIGHTS array has been updated:', this.clippedStatsWeights$$()); }); // prettier-ignore
    // effect(() => { console.log('CLIPPED STATS WEIGHTS AVG array has been updated:', this.clippedStatsWeightsAvg$$()); }); // prettier-ignore

    effect(() => {
      const dates = this.statsDates$$();

      this.maxSliderValue = dates.length - 1;
      this.selectedDateIdxHigh = dates.length - 1;

      this.sliderLowLabelAsDateIso = dates[this.selectedDateIdxLow];
      this.sliderHighLabelAsDateIso = dates[this.selectedDateIdxHigh];
    });

    effect(() => {
      const dates = this.clippedStatsDates$$();

      if (this.weightChart?.data) {
        const weights = this.clippedStatsWeights$$();
        const weightsAvg = this.clippedStatsWeightsAvg$$();
        this.weightChart.data.labels = dates;
        this.weightChart.data.datasets[0].data = weights;
        this.weightChart.data.datasets[1].data = weightsAvg;
        this.weightChart.update();
      }

      if (this.kcalsChart?.data) {
        const kcals = this.clippedStatsKcals$$();
        const kcalsAvg = this.clippedStatsKcalsAvg$$();
        this.kcalsChart.data.labels = dates;
        this.kcalsChart.data.datasets[0].data = kcals;
        this.kcalsChart.data.datasets[1].data = kcalsAvg;
        this.kcalsChart.update();
      }
    });
  }

  public ngOnInit(): void {
    this.weightChart = new Chart('WeightChart', WEIGHT_CHART_SETTINGS);
    this.kcalsChart = new Chart('KcalsChart', KCALS_CHART_SETTINGS);
    this.sliderChangeLow$.next(this.selectedDateIdxLow);
    this.sliderChangeHigh$.next(this.selectedDateIdxHigh);
    setTimeout(() => {
      this.weightChart.update();
      this.kcalsChart.update();
    }, 1);
  }

  public ngAfterViewInit(): void {
    if (this.weightChartCanvas) {
      this.weightChartCanvas.nativeElement.getContext('2d').canvas.height = 250;
    }
    if (this.kcalsChartCanvas) {
      this.kcalsChartCanvas.nativeElement.getContext('2d').canvas.height = 250;
    }
  }

  public ngOnDestroy(): void {}

  public formatDate(dateIso: string): string {
    const date = new Date(dateIso);
    const result = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    return result === 'Invalid Date' ? '' : result;
  }

  public clipDateRange(n: number) {
    let starIdx = 0;
    const endIdx = this.statsDates$$().length;
    if (n !== -1 && endIdx - n > 0) {
      starIdx = endIdx - n;
    }
    this.chartStartIdx$$.set(starIdx);
    this.selectedDateIdxLow = starIdx;
    this.chartEndIdx$$.set(endIdx);
    this.selectedDateIdxHigh = endIdx;
  }

  public sliderChangeLow(event: any) {
    this.sliderLowLabelAsDateIso = this.statsDates$$()[this.selectedDateIdxLow];
    const valueInt = parseInt(event.srcElement.value);
    const delta = this.selectedDateIdxHigh - this.selectedDateIdxLow;
    this.sliderChangeLow$.next(delta <= 0 ? valueInt - 2 : valueInt);
  }

  public sliderChangeHigh(event: any) {
    this.sliderHighLabelAsDateIso = this.statsDates$$()[this.selectedDateIdxHigh];
    const valueInt = parseInt(event.srcElement.value);
    const delta = this.selectedDateIdxHigh - this.selectedDateIdxLow;
    this.sliderChangeHigh$.next(delta <= 0 ? valueInt + 2 : valueInt);
  }

  private sliceArr(arr: Function): string[] {
    return arr().slice(this.chartStartIdx$$(), this.chartEndIdx$$());
  }

  private sliceArrWithDatesProcess(arr: Function): string[] {
    return arr().slice(this.chartStartIdx$$(), this.chartEndIdx$$()).map(this.formatDateTicks);
  }

  private formatSelectedRange(): string {
    let days = this.chartEndIdx$$() - this.chartStartIdx$$();
    const years = Math.floor(days / 360);
    days %= 360;
    const months = Math.floor(days / 30);
    days %= 30;

    let result = '';
    if (years > 0) {
      result += `${years} ${yearsRuDeclentions[years]}` + `${days > 0 || months > 0 ? ', ' : ''}`;
    }
    if (months > 0) {
      result += `${months} ${monthsRuDeclentions[months]}` + `${days > 0 ? ', ' : ''}`;
    }
    if (days > 0) {
      result += `${days} ${daysRuDeclentions[days]}`;
    }
    return result;
  }

  private formatDateTicks(dateIso: string): string {
    const date = new Date(dateIso);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
}
