import { animate, sequence, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { debounceTime, filter, Subject } from 'rxjs';

import { FoodService } from 'src/app/services/food.service';
import { BodyWeight } from 'src/app/shared/interfaces';

const COUNTDOWN_DELAY_MS = 2000;
const COUNTDOWN_DELAY_S = COUNTDOWN_DELAY_MS / 1000;

interface BodyWeightForm {
  bodyWeight: FormControl<string>;
}

type UIState = 'idle' | 'countdown' | 'submitting' | 'success' | 'error';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly submitTrigger = new Subject<void>();

  protected readonly uiState = signal<UIState>('idle');
  protected readonly prevValue = signal<string>('');

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

  constructor(
    protected readonly foodService: FoodService
  ) {
    this.initializeValueChanges();
    this.initializeSubmitTrigger();
  }

  public ngOnInit(): void {
    // TODO: Delete mocks
    this.prevValue.set('123');
    this.form.controls.bodyWeight.setValue(this.prevValue());
    this.form.controls.bodyWeight.markAsTouched();
  }

  private initializeValueChanges(): void {
    this.form.controls.bodyWeight.valueChanges.pipe(
      filter(() => this.form.valid),
      filter(value => value !== this.prevValue()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.uiState.set('countdown');
    });
  }

  private initializeSubmitTrigger(): void {
    this.submitTrigger.pipe(
      debounceTime(COUNTDOWN_DELAY_MS),
      filter(() => this.form.valid),
      filter(() => this.form.controls.bodyWeight.value !== this.prevValue()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.uiState.set('idle'); // Сбрасываем состояние перед отправкой
      this.submitWeight();
    });
  }

  protected onInput(): void {
    const control = this.form.controls.bodyWeight;
    control.markAsTouched();

    if (this.form.valid && control.value !== this.prevValue()) {
      this.uiState.set('idle'); // Сбрасываем состояние
      setTimeout(() => this.uiState.set('countdown')); // Запускаем анимацию в следующем тике
      this.submitTrigger.next();
    } else {
      this.uiState.set('idle');
    }
  }

  protected onEnter(): void {
    if (this.form.valid && this.form.controls.bodyWeight.value !== this.prevValue()) {
      this.submitWeight();
    }
  }

  private submitWeight(): void {
    this.uiState.set('submitting');
    this.form.disable();

    const weight: BodyWeight = {
      bodyWeight: this.form.controls.bodyWeight.value.replace(',', '.'),
      dateISO: this.foodService.selectedDayIso$$(),
    };
    console.log(weight);

    // TODO: Delete mock submission
    setTimeout(() => {
      this.prevValue.set(weight.bodyWeight);
      this.form.enable();
      this.uiState.set('success');
    }, 2000);

    // TODO: Implement weight submission
    // this.foodService.submitWeight(weight).pipe(
    //   takeUntilDestroyed(this.destroyRef)
    // ).subscribe({
    //   next: () => {
    //     this.prevValue.set(weight.bodyWeight);
    //     this.uiState.set('idle');
    //     this.form.enable();
    //   },
    //   error: () => {
    //     this.uiState.set('idle');
    //     this.form.enable();
    //   }
    // });
  }
}
