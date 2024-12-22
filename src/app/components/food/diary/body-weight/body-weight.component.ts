import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { FoodService } from 'src/app/services/food.service';
import { BodyWeight } from 'src/app/shared/interfaces';
import { AnimationStateManager, IndicatorState } from './animation-state.manager';

const COUNTDOWN_DELAY_MS = 2000;

interface BodyWeightForm {
  bodyWeight: FormControl<string>;
}

@Component({
  selector: 'app-body-weight',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './body-weight.component.html',
  styleUrl: './body-weight.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyWeightComponent implements OnInit {
  public IndicatorState = IndicatorState;
  public prevValue: string = '';

  private stateManager: AnimationStateManager;

  protected readonly form = new FormGroup<BodyWeightForm>({
    bodyWeight: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern(/^\d{2,3}([.,]\d)?$/)
      ],
      nonNullable: true,
    }),
  });

  constructor(
    protected readonly foodService: FoodService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.stateManager = new AnimationStateManager(cdRef);

    effect(() => {
      this.applyWeight();
    });
  }

  public ngOnInit(): void {
  }

  public applyWeight(): void {
    const selectedDateISO = this.foodService.selectedDayIso$$();
    const weight = this.foodService.diary$$()?.[selectedDateISO]?.['bodyWeight'];
    if (!weight) return;
    this.form.patchValue({ bodyWeight: String(weight) });
    this.prevValue = String(weight);
  }

  protected getState(state: IndicatorState): boolean {
    return this.stateManager.currentState === state;
  }

  protected onInput(): void {
    const control = this.form.controls.bodyWeight;
    control.markAsTouched();

    if (this.form.valid && control.value !== this.prevValue) {
      this.stateManager.startCountdown(() => this.submitWeight(), COUNTDOWN_DELAY_MS);
    } else {
      this.stateManager.setState(IndicatorState.Idle);
    }
  }

  protected onEnter(): void {
    if (!this.form.valid) {
      return;
    }

    if (this.stateManager.currentState === IndicatorState.Countdown) {
      this.stateManager.setState(IndicatorState.Idle);
    }
    this.submitWeight();
  }

  protected isSuffixInvalid(): boolean {
    const control = this.form.controls.bodyWeight;
    return control.invalid && control.touched && !control.pristine;
  }

  private async submitWeight(): Promise<void> {
    this.stateManager.setStateWithDelay(IndicatorState.Submitting);
    this.form.disable();

    const weight: BodyWeight = {
      bodyWeight: this.form.controls.bodyWeight.value.replace(',', '.'),
      dateISO: this.foodService.selectedDayIso$$(),
    };

    try {
      const result = await firstValueFrom(this.foodService.setUserBodyWeight(weight));
      this.form.enable();
      if (result) {
        this.prevValue = weight.bodyWeight;
        this.stateManager.setState(IndicatorState.Success);
      } else {
        this.stateManager.setState(IndicatorState.Error);
      }
    } catch {
      this.form.enable();
      this.stateManager.setState(IndicatorState.Error);
    }
  }
}
