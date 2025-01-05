import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { firstValueFrom } from 'rxjs';

import { FoodService } from 'src/app/services/food.service';
import { BodyWeight } from 'src/app/shared/interfaces';
import { AnimationStateManager, IndicatorState } from './animation-state.manager';

interface BodyWeightForm {
  bodyWeight: FormControl<string>;
}

@Component({
  selector: 'app-body-weight',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './body-weight.component.html',
  styleUrl: './body-weight.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyWeightComponent {
  public IndicatorState = IndicatorState;
  private previousValue: string = '';
  private stateManager: AnimationStateManager;

  public form = new FormGroup<BodyWeightForm>({
    bodyWeight: new FormControl('', {
      validators: [Validators.required, Validators.pattern(/^\d{2,3}([.,]\d)?$/)],
      nonNullable: true,
    }),
  });

  constructor(
    private foodService: FoodService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.stateManager = new AnimationStateManager(cdRef);
    effect(() => {
      this.applyWeight();
    });
  }

  public getState(state: IndicatorState): boolean {
    return this.stateManager.currentState === state;
  }

  public get isFormValid(): boolean {
    return this.form.valid || this.form.disabled;
  }

  public onEnter(): void {
    if (!this.form.valid) {
      return;
    }

    if (this.stateManager.currentState === IndicatorState.Countdown) {
      this.stateManager.setState(IndicatorState.Idle);
    }
    this.submitValue();
  }

  public onInput(): void {
    const control = this.form.controls.bodyWeight;
    control.markAsTouched();

    if (this.form.valid && control.value !== String(this.previousValue)) {
      this.stateManager.startCountdown(() => this.submitValue(), 2000);
    } else {
      this.stateManager.setState(IndicatorState.Idle);
    }
  }

  private async submitValue(): Promise<void> {
    this.stateManager.setStateWithDelay(IndicatorState.Submitting);
    console.log('before', this.form.valid);
    this.form.disable();
    console.log('after', this.form.valid);

    try {
      const weight: BodyWeight = {
        bodyWeight: this.form.controls.bodyWeight.value.replace(',', '.'),
        dateISO: this.foodService.selectedDayIso$$(),
      };

      const result = await firstValueFrom(this.foodService.setUserBodyWeight(weight));
      if (!result) throw new Error();

      this.previousValue = this.form.controls.bodyWeight.value;
      this.stateManager.setState(IndicatorState.Success);
    } catch {
      this.stateManager.setState(IndicatorState.Error);
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
