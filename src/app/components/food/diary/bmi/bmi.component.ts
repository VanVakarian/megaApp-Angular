import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnInit, Signal, ViewChild } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import { FoodService } from 'src/app/services/food.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-bmi',
  templateUrl: './bmi.component.html',
  styleUrl: './bmi.component.css',
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class BMIComponent implements OnInit {
  @ViewChild('bmiMeter') bmiMeter!: ElementRef;

  public bmiPointerShift$$: Signal<number> = computed(() => this.getPointerShift());

  private selectedDateWeight$$: Signal<number> = computed(() => this.getSelectedDateWeight());

  private bmiValues = [16, 18.5, 25, 30, 35, 40, 45];
  private bmiLevelsWidthFractions$$: Signal<number[]> = computed(() => this.calculateBmiLevelsWidthFractions());
  private bmiLevelsThresholdsInKgs$$: Signal<number[]> = computed(() => this.prepBmiLevelsThresholdsInKgs());

  public get bmiContainerWidthInPx() {
    return this.bmiMeter?.nativeElement?.clientWidth ? this.bmiMeter.nativeElement.clientWidth - 2 : 0; // adjusting for padding
  }

  constructor(
    public foodService: FoodService,
    public settingsService: SettingsService,
  ) {
    effect(() => {
      // console.log('bmiLevelsThresholdsInKgs has been updated:', this.bmiLevelsThresholdsInKgs$$()); // prettier-ignore
      // console.log('bmiLevelsWidthFractions has been updated:', this.bmiLevelsWidthFractions$$()); // prettier-ignore
    });
  }

  public ngOnInit() {}

  public setBmiSectionWidth(sectionIdx: number) {
    const bmiMeterWidth = this.bmiContainerWidthInPx;
    if (!bmiMeterWidth) return { width: 0 };

    const width = ((this.bmiLevelsWidthFractions$$()[sectionIdx] * 100) * (bmiMeterWidth / 100)) // prettier-ignore
    return { width: `${width}px` };
  }

  public setBmiKgBorderValue(idx: number) {
    return this.bmiLevelsThresholdsInKgs$$()[idx];
  }

  private getSelectedDateWeight() {
    const selectedDateISO = this.foodService.selectedDayIso$$();
    return this.foodService.diary$$()?.[selectedDateISO]?.bodyWeight ?? 0;
  }

  private getPointerShift(): number {
    const weight = this.selectedDateWeight$$();
    const bmiKgs = this.bmiLevelsThresholdsInKgs$$();
    const bmiMeterWidth = this.bmiContainerWidthInPx ? this.bmiContainerWidthInPx : 0;
    const percentShift = (weight - bmiKgs[0]) / (bmiKgs[bmiKgs.length - 1] - bmiKgs[0]);
    return bmiMeterWidth * percentShift;
  }

  private prepBmiLevelsThresholdsInKgs(): number[] {
    const height = this.settingsService.settings$$().height;
    if (!height) return [];

    const heightMeters = height / 100;
    return this.bmiValues.map((value) => {
      return Math.round(value * (heightMeters * heightMeters));
    });
  }

  private calculateBmiLevelsWidthFractions(): number[] {
    const fractions: number[] = [];
    const total = this.bmiValues[this.bmiValues.length - 1] - this.bmiValues[0];

    for (let i = 0; i < this.bmiValues.length - 1; i++) {
      const segment = this.bmiValues[i + 1] - this.bmiValues[i];
      fractions.push(segment / total);
    }

    return fractions;
  }
}
