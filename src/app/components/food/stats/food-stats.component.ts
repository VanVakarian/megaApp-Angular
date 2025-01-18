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
import { MatButtonModule } from '@angular/material/button';
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
import { firstValueFrom } from 'rxjs';
import { FoodStatsService } from 'src/app/services/food-stats.service';
import {
  KCALS_CHART_SETTINGS,
  WEIGHT_CHART_SETTINGS,
  daysRuDeclentions,
  monthsRuDeclentions,
  yearsRuDeclentions,
} from 'src/app/shared/const';
import { debounce, throttle } from 'src/app/shared/utils';

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
  imports: [CommonModule, MatCardModule, MatSliderModule, FormsModule, MatButtonModule],
  standalone: true,
})
export class FoodStatsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('weightChartCanvas')
  public weightChartCanvas!: ElementRef;

  @ViewChild('kcalsChartCanvas')
  public kcalsChartCanvas!: ElementRef;

  public weightChart: any;
  public kcalsChart: any;

  public selectedDateIdxLow$$: WritableSignal<number> = signal(0);
  public selectedDateIdxHigh$$: WritableSignal<number> = signal(1);

  public sliderLowLabelAsDateIso: string = '';
  public sliderHighLabelAsDateIso: string = '';

  private statsData$$: Signal<StatsData> = computed(() => this.prepStatsData());

  private sliderConfig$$: Signal<{ maxValue: number; highValue: number }> = computed(() => {
    const dates = this.statsData$$().dates;
    return {
      maxValue: dates.length - 1,
      highValue: dates.length - 1,
    };
  });

  private chartData$$: Signal<ChartData> = computed(() => {
    const data = this.statsData$$();
    const start = this.selectedDateIdxLow$$();
    const end = this.selectedDateIdxHigh$$();

    return {
      dates: data.dates.slice(start, end).map(this.formatDateTicks),
      weights: data.weights.slice(start, end),
      weightsAvg: data.weightsAvg.slice(start, end),
      kcals: data.kcals.slice(start, end),
      kcalsAvg: data.kcalsAvg.slice(start, end),
    };
  });

  public selectedRangeDescription$$: Signal<string> = computed(() => this.formatSelectedRange());

  public maxSliderValue: Signal<number> = computed(() => this.sliderConfig$$().maxValue);

  public get selectedDateIdxLow(): number {
    return this.selectedDateIdxLow$$();
  }

  public set selectedDateIdxLow(value: number) {
    this.selectedDateIdxLow$$.set(value);
  }

  public get selectedDateIdxHigh(): number {
    return this.selectedDateIdxHigh$$();
  }

  public set selectedDateIdxHigh(value: number) {
    this.selectedDateIdxHigh$$.set(value);
  }

  constructor(private foodStatsService: FoodStatsService) {
    const throttledUpdate = this.createThrottledChartUpdater();
    const debouncedUpdate = this.createDebouncedChartUpdater();

    effect(() => {
      const dates = this.statsData$$().dates;
      // const config = this.sliderConfig$$();
      this.sliderLowLabelAsDateIso = dates[this.selectedDateIdxLow$$()];
      this.sliderHighLabelAsDateIso = dates[this.selectedDateIdxHigh$$()];
    });

    effect(() => {
      const data = this.chartData$$();
      throttledUpdate(data);
      debouncedUpdate(data);
    });
  }

  private updateWeightChart(data: ChartData, mode: 'none' | undefined = undefined) {
    if (this.weightChart?.data) {
      this.weightChart.data.labels = data.dates;
      this.weightChart.data.datasets[0].data = data.weights;
      this.weightChart.data.datasets[1].data = data.weightsAvg;
      this.weightChart.update(mode);
    }
  }

  private updateKcalsChart(data: ChartData, mode: 'none' | undefined = undefined) {
    if (this.kcalsChart?.data) {
      this.kcalsChart.data.labels = data.dates;
      this.kcalsChart.data.datasets[0].data = data.kcals;
      this.kcalsChart.data.datasets[1].data = data.kcalsAvg;
      this.kcalsChart.update(mode);
    }
  }

  private createThrottledChartUpdater() {
    return throttle((data: ChartData) => {
      this.updateWeightChart(data, 'none');
      this.updateKcalsChart(data, 'none');
    }, 100);
  }

  private createDebouncedChartUpdater() {
    return debounce((data: ChartData) => {
      this.updateWeightChart(data);
      this.updateKcalsChart(data);
    }, 100);
  }

  public async ngOnInit(): Promise<void> {
    await firstValueFrom(this.foodStatsService.getStats());

    this.weightChart = new Chart('WeightChart', WEIGHT_CHART_SETTINGS);
    this.kcalsChart = new Chart('KcalsChart', KCALS_CHART_SETTINGS);

    this.selectedDateIdxHigh$$.set(this.sliderConfig$$().highValue);
    this.sliderHighLabelAsDateIso = this.statsData$$().dates[this.sliderConfig$$().highValue];

    setTimeout(() => {
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
    this.selectedDateIdxLow$$.set(starIdx);
    this.selectedDateIdxHigh$$.set(endIdx - 1);
    this.sliderLowLabelAsDateIso = this.statsData$$().dates[starIdx];
    this.sliderHighLabelAsDateIso = this.statsData$$().dates[endIdx - 1];
  }

  public sliderChangeLow(event: any) {
    const valueInt = parseInt(event.srcElement.value);
    const delta = this.selectedDateIdxHigh$$() - valueInt;
    if (delta > 0) {
      this.selectedDateIdxLow$$.set(valueInt);
      this.sliderLowLabelAsDateIso = this.statsData$$().dates[valueInt];
    }
  }

  public sliderChangeHigh(event: any) {
    const valueInt = parseInt(event.srcElement.value);
    const delta = valueInt - this.selectedDateIdxLow$$();
    if (delta > 0) {
      this.selectedDateIdxHigh$$.set(valueInt);
      this.sliderHighLabelAsDateIso = this.statsData$$().dates[valueInt];
    }
  }

  private prepStatsData() {
    const stats = this.foodStatsService.stats$$();
    const result: StatsData = { dates: [], weights: [], weightsAvg: [], kcals: [], kcalsAvg: [] };

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

  private formatSelectedRange(): string {
    let days = this.selectedDateIdxHigh$$() - this.selectedDateIdxLow$$() + 1;
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
