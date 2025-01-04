import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidatorFn } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { InputWithProgressSubmitData } from '../../interfaces';
import { AnimationStateManager, IndicatorState } from './animation-state.manager';

interface InputForm {
  value: FormControl<string>;
}

@Component({
  selector: 'app-input-with-progress',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './input-with-progress.component.html',
  styleUrl: './input-with-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputWithProgressComponent),
      multi: true,
    },
  ],
})
export class InputWithProgressComponent implements ControlValueAccessor {
  @Input()
  public label: string = '';

  @Input()
  public suffix: string = '';

  @Input()
  public errorText: string = '';

  @Input()
  public countdownDelay: number = 2000;

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
  public prevValue: string = '';

  private stateManager: AnimationStateManager;
  private _validators: ValidatorFn[] = [];
  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

  protected readonly form = new FormGroup<InputForm>({
    value: new FormControl('', {
      nonNullable: true,
    }),
  });

  constructor(private cdRef: ChangeDetectorRef) {
    this.stateManager = new AnimationStateManager(cdRef);

    this.form.controls.value.valueChanges.subscribe(value => {
      this.onChange(value);
      this.valueChange.emit(value);
    });
  }

  public writeValue(value: string): void {
    if (value !== this.form.controls.value.value) {
      this.form.patchValue({ value });
      this.prevValue = value;
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

  public get isValid(): boolean {
    return this.form.valid;
  }

  protected getState(state: IndicatorState): boolean {
    return this.stateManager.currentState === state;
  }

  protected onInput(): void {
    const control = this.form.controls.value;
    control.markAsTouched();
    this.onTouched();

    if (this.form.valid && control.value !== this.prevValue) {
      this.stateManager.startCountdown(() => this.submitValue(), this.countdownDelay);
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
    this.submitValue();
  }

  protected isSuffixInvalid(): boolean {
    const control = this.form.controls.value;
    return control.invalid && control.touched && !control.pristine;
  }

  private async submitValue(): Promise<void> {
    this.stateManager.setStateWithDelay(IndicatorState.Submitting);
    this.form.disable();

    try {
      await new Promise<void>((resolve, reject) => {
        this.submit.emit({
          value: this.form.controls.value.value,
          resolve,
          reject
        });
      });

      this.prevValue = this.form.controls.value.value;
      this.stateManager.setState(IndicatorState.Success);
    } catch {
      this.stateManager.setState(IndicatorState.Error);
    } finally {
      this.form.enable();
    }
  }

  // private async submitValue(): Promise<void> {
  //   this.stateManager.setStateWithDelay(IndicatorState.Submitting);
  //   this.form.disable();

  //   try {
  //     await new Promise<void>((resolve, reject) => {
  //       this.submit.emit({
  //         value: this.form.controls.value.value,
  //         resolve,
  //         reject
  //       });
  //     });

  //     this.prevValue = this.form.controls.value.value;
  //     this.stateManager.setState(IndicatorState.Success);
  //   } catch {
  //     this.stateManager.setState(IndicatorState.Error);
  //   } finally {
  //     this.form.enable();
  //   }
  // }
  // private submitValue(): void {
  //   this.stateManager.setStateWithDelay(IndicatorState.Submitting);
  //   this.form.disable();

  //   try {
  //     this.submit.emit(this.form.controls.value.value);
  //     this.prevValue = this.form.controls.value.value;
  //     this.stateManager.setState(IndicatorState.Success);
  //   } catch {
  //     this.stateManager.setState(IndicatorState.Error);
  //   } finally {
  //     this.form.enable();
  //   }
  // }
}
