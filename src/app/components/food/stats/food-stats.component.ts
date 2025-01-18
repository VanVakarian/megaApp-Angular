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

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Subject, firstValueFrom, throttleTime } from 'rxjs';
import { FoodStatsService } from 'src/app/services/food-stats.service';

import {
  KCALS_CHART_SETTINGS,
  WEIGHT_CHART_SETTINGS,
  daysRuDeclentions,
  monthsRuDeclentions,
  yearsRuDeclentions,
} from 'src/app/shared/const';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface StatsData {
  dates: string[];
  weights: number[];
  weightsAvg: number[];
  kcals: number[];
  kcalsAvg: number[];
}

interface ChartData {
  dates: string[];
  weights: number[];
  weightsAvg: number[];
  kcals: number[];
  kcalsAvg: number[];
}

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

  private statsData$$: Signal<StatsData> = computed(() => ({
    dates: this.getStatsDates(),
    weights: this.getValuesAtSpecificPosition(0),
    weightsAvg: this.getValuesAtSpecificPosition(1),
    kcals: this.getValuesAtSpecificPosition(2),
    kcalsAvg: this.getValuesAtSpecificPosition(3),
  }));

  private chartStartIdx$$: WritableSignal<number> = signal(0);
  private chartEndIdx$$: WritableSignal<number> = signal(1);

  private chartData$$: Signal<ChartData> = computed(() => {
    const data = this.statsData$$();
    const start = this.chartStartIdx$$();
    const end = this.chartEndIdx$$();

    return {
      dates: data.dates.slice(start, end).map(this.formatDateTicks),
      weights: data.weights.slice(start, end),
      weightsAvg: data.weightsAvg.slice(start, end),
      kcals: data.kcals.slice(start, end),
      kcalsAvg: data.kcalsAvg.slice(start, end),
    };
  });

  public selectedRangeDescription$$: Signal<string> = computed(() => this.formatSelectedRange());

  constructor(private foodStatsService: FoodStatsService) {
    this.sliderChangeLow$.pipe(throttleTime(33)).subscribe((value) => {
      this.chartStartIdx$$.set(value);
    });

    this.sliderChangeHigh$.pipe(throttleTime(33)).subscribe((value) => {
      this.chartEndIdx$$.set(value);
    });

    // Initialize slider values when data changes
    effect(() => {
      const dates = this.statsData$$().dates;
      this.maxSliderValue = dates.length - 1;
      this.selectedDateIdxHigh = dates.length - 1;
      this.sliderLowLabelAsDateIso = dates[this.selectedDateIdxLow];
      this.sliderHighLabelAsDateIso = dates[this.selectedDateIdxHigh];
    });

    // Update charts when data or range changes
    effect(() => {
      const data = this.chartData$$();
      this.updateCharts(data);
    });
  }

  private updateCharts(data: ChartData) {
    if (this.weightChart?.data) {
      this.weightChart.data.labels = data.dates;
      this.weightChart.data.datasets[0].data = data.weights;
      this.weightChart.data.datasets[1].data = data.weightsAvg;
      this.weightChart.update();
    }

    if (this.kcalsChart?.data) {
      this.kcalsChart.data.labels = data.dates;
      this.kcalsChart.data.datasets[0].data = data.kcals;
      this.kcalsChart.data.datasets[1].data = data.kcalsAvg;
      this.kcalsChart.update();
    }
  }

  public async ngOnInit(): Promise<void> {
    await firstValueFrom(this.foodStatsService.getStats());

    this.weightChart = new Chart('WeightChart', WEIGHT_CHART_SETTINGS);
    this.kcalsChart = new Chart('KcalsChart', KCALS_CHART_SETTINGS);
    this.sliderChangeLow$.next(this.selectedDateIdxLow);
    this.sliderChangeHigh$.next(this.selectedDateIdxHigh);
    setTimeout(() => {
      // this.weightChart.update();
      // this.kcalsChart.update();
      this.clipDateRange(90);
    }, 0);
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
    const endIdx = this.statsData$$().dates.length;
    if (n !== -1 && endIdx - n > 0) {
      starIdx = endIdx - n;
    }
    this.chartStartIdx$$.set(starIdx);
    this.selectedDateIdxLow = starIdx;
    this.chartEndIdx$$.set(endIdx);
    this.selectedDateIdxHigh = endIdx;
    this.sliderLowLabelAsDateIso = this.statsData$$().dates[this.selectedDateIdxLow];
    this.sliderHighLabelAsDateIso = this.statsData$$().dates[this.selectedDateIdxHigh];
  }

  public sliderChangeLow(event: any) {
    this.sliderLowLabelAsDateIso = this.statsData$$().dates[this.selectedDateIdxLow];
    const valueInt = parseInt(event.srcElement.value);
    const delta = this.selectedDateIdxHigh - this.selectedDateIdxLow;
    this.sliderChangeLow$.next(delta <= 0 ? valueInt - 2 : valueInt);
  }

  public sliderChangeHigh(event: any) {
    this.sliderHighLabelAsDateIso = this.statsData$$().dates[this.selectedDateIdxHigh];
    const valueInt = parseInt(event.srcElement.value);
    const delta = this.selectedDateIdxHigh - this.selectedDateIdxLow;
    this.sliderChangeHigh$.next(delta <= 0 ? valueInt + 2 : valueInt);
  }

  private getStatsDates() {
    return Object.keys(this.foodStatsService.stats$$());
  }

  private getValuesAtSpecificPosition(position: number): number[] {
    return Object.entries(this.foodStatsService.stats$$()).map(([key, value]) => value[position]);
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
