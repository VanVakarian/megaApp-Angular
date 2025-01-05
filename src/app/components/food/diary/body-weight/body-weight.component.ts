import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { firstValueFrom } from 'rxjs';

import { FoodService } from 'src/app/services/food.service';
import { DEFAULT_FIELD_PROGRESS_TIMER_MS } from 'src/app/shared/const';
import {
  AnimationState,
  FieldStateAnimationsDirective,
} from 'src/app/shared/directives/field-state-animations.directive';
import { BodyWeight } from 'src/app/shared/interfaces';

interface BodyWeightForm {
  bodyWeight: FormControl<string>;
}

@Component({
  selector: 'app-body-weight',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, FieldStateAnimationsDirective],
  templateUrl: './body-weight.component.html',
  styleUrl: './body-weight.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyWeightComponent {
  public form = new FormGroup<BodyWeightForm>({
    bodyWeight: new FormControl('', {
      validators: [Validators.required, Validators.pattern(/^\d{2,3}([.,]\d)?$/)],
      nonNullable: true,
    }),
  });

  public currentState: AnimationState = AnimationState.Idle;
  private previousValue: string = '';
  private submitTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private foodService: FoodService,
    private cdRef: ChangeDetectorRef,
  ) {
    effect(() => {
      this.applyWeight();
    });
  }

  public get isFormValid(): boolean {
    return this.form.valid || this.form.disabled;
  }

  public onEnter(): void {
    if (!this.form.valid) {
      return;
    }

    if (this.currentState === AnimationState.Countdown) {
      this.currentState = AnimationState.Idle;
    }
    this.submitValue();
  }

  public onInput(): void {
    const control = this.form.controls.bodyWeight;
    control.markAsTouched();

    if (this.form.valid && control.value !== String(this.previousValue)) {
      this.currentState = AnimationState.Idle;
      setTimeout(() => {
        this.currentState = AnimationState.Countdown;
        this.cdRef.detectChanges();
      });

      if (this.submitTimer) {
        clearTimeout(this.submitTimer);
      }
      this.submitTimer = setTimeout(() => {
        if (this.currentState === AnimationState.Countdown) this.submitValue();
      }, DEFAULT_FIELD_PROGRESS_TIMER_MS);
    } else {
      this.currentState = AnimationState.Idle;
    }
  }

  private async submitValue(): Promise<void> {
    this.currentState = AnimationState.Submitting;
    this.form.disable();

    try {
      const weight: BodyWeight = {
        bodyWeight: this.form.controls.bodyWeight.value.replace(',', '.'),
        dateISO: this.foodService.selectedDayIso$$(),
      };

      const result = await firstValueFrom(this.foodService.setUserBodyWeight(weight));
      if (!result) throw new Error();

      this.previousValue = this.form.controls.bodyWeight.value;
      this.currentState = AnimationState.Success;
    } catch {
      this.currentState = AnimationState.Error;
    } finally {
      this.form.enable();
    }
  }

  private applyWeight(): void {
    const selectedDateISO = this.foodService.selectedDayIso$$();
    const weight = this.foodService.diary$$()?.[selectedDateISO]?.['bodyWeight'];
    if (!weight) return;

    this.form.patchValue({ bodyWeight: String(weight) });
    this.previousValue = String(weight);
  }
}
