import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { RequestStatus, SettingsService } from 'src/app/services/settings.service';
import { DEFAULT_FIELD_PROGRESS_TIMER_MS } from 'src/app/shared/const';
import {
  AnimationState,
  FieldStateAnimationsDirective,
} from 'src/app/shared/directives/field-state-animations.directive';

interface SettingsForm {
  darkTheme: FormControl<boolean>;
  selectedChapterFood: FormControl<boolean>;
  selectedChapterMoney: FormControl<boolean>;
  height: FormControl<string>;
}

@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrl: './settings-form.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FieldStateAnimationsDirective,
  ],
})
export class SettingsFormComponent implements OnInit {
  public settingsForm = new FormGroup<SettingsForm>({
    darkTheme: new FormControl(this.settingsService.settings$$().darkTheme, { nonNullable: true }),
    selectedChapterFood: new FormControl(this.settingsService.settings$$().selectedChapterFood, { nonNullable: true }),
    selectedChapterMoney: new FormControl(this.settingsService.settings$$().selectedChapterMoney, {
      nonNullable: true,
    }),
    height: new FormControl('', {
      validators: [Validators.required, Validators.pattern(/^\d{3}$/)],
      nonNullable: true,
    }),
  });

  public heightFieldState: AnimationState = AnimationState.Idle;
  private heightPreviousValue: string = '';
  private heightSubmitTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private settingsService: SettingsService) {
    effect(() => {
      this.applySettingsToFrom();
      this.setHeightFieldState();
    });
  }

  public ngOnInit(): void {
    this.settingsForm.controls.darkTheme.valueChanges.subscribe((value) => {
      this.settingsService.settings$$.update((settings) => ({ ...settings, darkTheme: value }));
      this.settingsService.applyTheme();
      this.settingsService.saveSettings();
    });
  }

  public toggleChapterSelection(chapter: 'selectedChapterFood' | 'selectedChapterMoney'): void {
    const control = this.settingsForm.controls[chapter];
    const currentValue = control.value;
    control.setValue(!currentValue);

    this.settingsService.settings$$.update((settings) => ({
      ...settings,
      [chapter]: !currentValue,
    }));
    this.settingsService.saveSettings();
  }

  public get isHeightValid(): boolean {
    return this.settingsForm.controls.height.valid || this.settingsForm.controls.height.disabled;
  }

  public onHeightEnter(): void {
    if (!this.settingsForm.controls.height.valid) return;

    if (this.heightFieldState === AnimationState.Countdown) {
      this.heightFieldState = AnimationState.Idle;
    }
    this.submitHeightValue();
  }

  public onHeightInput(): void {
    const control = this.settingsForm.controls.height;
    control.markAsTouched();

    if (control.valid && control.value !== String(this.heightPreviousValue)) {
      this.heightFieldState = AnimationState.Idle;
      setTimeout(() => {
        this.heightFieldState = AnimationState.Countdown;
      });

      if (this.heightSubmitTimer) {
        clearTimeout(this.heightSubmitTimer);
      }
      this.heightSubmitTimer = setTimeout(() => {
        if (this.heightFieldState === AnimationState.Countdown) {
          this.submitHeightValue();
        }
      }, DEFAULT_FIELD_PROGRESS_TIMER_MS);
    } else {
      this.heightFieldState = AnimationState.Idle;
    }
  }

  private async submitHeightValue(): Promise<void> {
    const control = this.settingsForm.controls.height;

    this.heightFieldState = AnimationState.Submitting;
    this.settingsForm.disable();

    const height = control.value.replace(',', '.');
    this.settingsForm.patchValue({ height });
    this.settingsService.settings$$.update((settings) => ({
      ...settings,
      height: Number(height),
    }));

    try {
      await this.settingsService.saveSettings();
      this.heightPreviousValue = control.value;
    } catch (error) {
      console.error(error);
    } finally {
      this.settingsForm.enable();
    }
  }

  private applySettingsToFrom(): void {
    const settings = this.settingsService.settings$$();
    if (settings) {
      this.settingsForm.patchValue(
        {
          darkTheme: settings.darkTheme,
          selectedChapterFood: settings.selectedChapterFood,
          selectedChapterMoney: settings.selectedChapterMoney,
          height: String(settings.height),
        },
        { emitEvent: false },
      );
      this.settingsService.applyTheme();
    }
  }

  private setHeightFieldState(): void {
    const requestStatus = this.settingsService.heightRequestStatus$$();

    if (requestStatus === RequestStatus.InProgress) {
      this.heightFieldState = AnimationState.Submitting;
    }

    if (requestStatus === RequestStatus.Success) {
      this.heightFieldState = AnimationState.Success;
    }

    if (requestStatus === RequestStatus.Error) {
      this.heightFieldState = AnimationState.Error;
    }
  }
}
