import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DEFAULT_FIELD_PROGRESS_TIMER_MS } from 'src/app/shared/const';
import { InputWithProgressSubmitData } from 'src/app/shared/interfaces';
import { AnimationStateManager, IndicatorState } from './animation-state.manager';

interface InputForm {
  value: FormControl<string>;
}

@Component({
  selector: 'app-input-with-progress',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './input-with-progress.component.html',
  styleUrl: './input-with-progress.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputWithProgressComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputWithProgressComponent implements ControlValueAccessor {
  @Input()
  public label: string = '';

  @Input()
  public suffix: string = '';

  @Input()
  public errorText: string = '';

  @Input()
  public countdownDelay: number = DEFAULT_FIELD_PROGRESS_TIMER_MS;

  @Input()
  public set validators(value: ValidatorFn[]) {
    this._validators = value;
    this.form.controls.value.setValidators(value);
    this.form.controls.value.updateValueAndValidity();
  }

  @Output()
  public valueChange = new EventEmitter<string>();

  @Output()
  public submit = new EventEmitter<InputWithProgressSubmitData>();

  public IndicatorState = IndicatorState;

  private previousValue: string = '';
  private stateManager: AnimationStateManager;
  private _validators: ValidatorFn[] = [];
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  public form = new FormGroup<InputForm>({
    value: new FormControl('', {
      nonNullable: true,
    }),
  });

  public get isValid(): boolean {
    return this.form.valid;
  }

  public get isSuffixValid(): boolean {
    const control = this.form.controls.value;
    return control.valid && control.touched && !control.pristine;
  }

  constructor(private cdRef: ChangeDetectorRef) {
    this.stateManager = new AnimationStateManager(cdRef);

    this.form.controls.value.valueChanges.subscribe((value) => {
      this.onChange(value);
      this.valueChange.emit(value);
    });
  }

  public writeValue(value: string): void {
    if (value !== this.form.controls.value.value) {
      this.form.patchValue({ value });
      this.previousValue = value;
    }
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  public getState(state: IndicatorState): boolean {
    return this.stateManager.currentState === state;
  }

  public onInput(): void {
    const control = this.form.controls.value;
    control.markAsTouched();
    this.onTouched();

    if (this.form.valid && control.value !== String(this.previousValue)) {
      this.stateManager.startCountdown(() => this.submitValue(), this.countdownDelay);
    } else {
      this.stateManager.setState(IndicatorState.Idle);
    }
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

  private async submitValue(): Promise<void> {
    this.stateManager.setStateWithDelay(IndicatorState.Submitting);
    this.form.disable();

    try {
      await new Promise<void>((resolve, reject) => {
        this.submit.emit({
          value: this.form.controls.value.value,
          resolve,
          reject,
        });
      });

      this.previousValue = this.form.controls.value.value;
      this.stateManager.setState(IndicatorState.Success);
    } catch {
      this.stateManager.setState(IndicatorState.Error);
    } finally {
      this.form.enable();
    }
  }
}
