import { animate, sequence, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { debounceTime, filter, firstValueFrom, Subject } from 'rxjs';

import { FoodService } from 'src/app/services/food.service';
import { BodyWeight } from 'src/app/shared/interfaces';

const COUNTDOWN_DELAY_MS = 2000;
const COUNTDOWN_DELAY_S = COUNTDOWN_DELAY_MS / 1000;

enum UIState {
  Idle = 'idle',
  Countdown = 'countdown',
  Submitting = 'submitting',
  Success = 'success',
  Error = 'error'
}

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
  animations: [
    trigger('countdown-bar', [
      transition(':enter', [sequence([style({ width: '0%' }), animate(`${ COUNTDOWN_DELAY_S }s`, style({ width: '100%' }))])]),
    ]),
  ],
})
export class BodyWeightComponent implements OnInit {
  public UIState = UIState;

  public prevValue: string = '';

  private uiState: typeof UIState[keyof typeof UIState] = UIState.Idle;

  protected readonly form = new FormGroup<BodyWeightForm>({
    bodyWeight: new FormControl('', {
      validators: [
        Validators.required,
        // a two- or a three-digit number with or without a decimal part with only one digit after a dot (or a comma)
        Validators.pattern(/^\d{2,3}([.,]\d)?$/)
      ],
      nonNullable: true,
    }),
  });

  private readonly destroyRef = inject(DestroyRef);

  private readonly submitTrigger = new Subject<void>();

  constructor(
    protected readonly foodService: FoodService,
  ) {
    this.initializeSubmitTrigger();
  }

  public ngOnInit(): void {
  }

  private initializeSubmitTrigger(): void {
    this.submitTrigger.pipe(
      debounceTime(COUNTDOWN_DELAY_MS),
      filter(() => this.form.valid),
      filter(() => this.form.controls.bodyWeight.value !== this.prevValue),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.submitWeight();
    });
  }

  protected onInput(): void {
    console.log('onInput fired');
    const control = this.form.controls.bodyWeight;
    control.markAsTouched();

    if (this.form.valid && control.value !== this.prevValue) {
      console.log('form is valid');
      this.uiState = UIState.Countdown;
      this.submitTrigger.next();
    } else {
      this.uiState = UIState.Idle;
    }
  }

  // protected onEnter(): void {
  //   if (this.form.valid && this.form.controls.bodyWeight.value !== this.prevValue) {
  //     this.submitWeight();
  //   }
  // }

  private async submitWeight(): Promise<void> {
    this.uiState = UIState.Idle;
    setTimeout(() => this.uiState = UIState.Submitting);
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
        this.uiState = UIState.Success;
      } else {
        this.uiState = UIState.Error;
      }
    } catch {
      this.form.enable();
      this.uiState = UIState.Error;
    }
  }

  public getState(state: UIState): boolean {
    return this.uiState === state;
  }
}
