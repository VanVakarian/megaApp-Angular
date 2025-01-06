import { CommonModule } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { RequestStatus, SettingsService } from 'src/app/services/settings.service';
import { DEFAULT_INPUT_FIELD_PROGRESS_TIMER } from 'src/app/shared/const';
import {
  AnimationState,
  AnimationStateManager,
  FieldStateAnimationsDirective,
} from 'src/app/shared/directives/field-state-animations.directive';
import { KeyOfSettings } from 'src/app/shared/interfaces';

interface SettingsForm {
  selectedChapterFood: FormControl<boolean>;
  selectedChapterMoney: FormControl<boolean>;
  darkTheme: FormControl<boolean>;
  height: FormControl<string>;
}

type FormFields = keyof SettingsForm;

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
  public readonly KeyOfSettings = KeyOfSettings;

  public settingsForm = new FormGroup<SettingsForm>({
    selectedChapterFood: new FormControl(this.settingsService.settings$$().selectedChapterFood, { nonNullable: true }),
    selectedChapterMoney: new FormControl(this.settingsService.settings$$().selectedChapterMoney, {
      nonNullable: true,
    }),
    darkTheme: new FormControl(this.settingsService.settings$$().darkTheme, { nonNullable: true }),
    height: new FormControl('', {
      validators: [Validators.required, Validators.pattern(/^\d{3}$/)],
      nonNullable: true,
    }),
  });

  public heightFieldState: AnimationState = AnimationState.Idle;
  private heightPreviousValue: number = 0;
  private heightSubmitDelay: ReturnType<typeof setTimeout> | null = null;
  private heightFieldAnimationStateManager = new AnimationStateManager(AnimationState.Idle, (state) => {
    this.heightFieldState = state;
  });

  constructor(private settingsService: SettingsService) {
    effect(() => {
      // this.applySettingsToFrom();
      this.blockFieldsOnRequestsStatusChanes();
    });
  }

  ngOnInit(): void {
    console.log('this.settingsService.settings$$()', this.settingsService.settings$$());
    this.applySettingsToForm();
    // this.blockFieldsOnRequestsStatusChanes();
  }

  public onSelectedChapterChipToggle(chapterName: FormFields): void {
    const setting = { [chapterName]: !this.settingsForm.controls[chapterName].value };
    this.settingsService.saveSelectedChapter(setting);
  }

  public async onThemeToggle(): Promise<void> {
    const setting = { darkTheme: this.settingsForm.controls.darkTheme.value };
    this.settingsService.applyTheme(setting.darkTheme);
    await this.settingsService.saveSelectedChapter(setting);
  }

  public get isHeightValid(): boolean {
    return this.settingsForm.controls.height.valid || this.settingsForm.controls.height.disabled;
  }

  public onHeightEnter(): void {
    if (!this.settingsForm.controls.height.valid) return;

    if (this.heightFieldState === AnimationState.Countdown) {
      this.heightFieldAnimationStateManager.toIdle();
    }

    this.submitHeightValue();
  }

  public onHeightInput(): void {
    const control = this.settingsForm.controls.height;
    control.markAsTouched();
    if (control.valid && Number(control.value) !== this.heightPreviousValue) {
      this.heightFieldAnimationStateManager.toIdle();
      setTimeout(() => this.heightFieldAnimationStateManager.toCountdown());

      if (this.heightSubmitDelay) clearTimeout(this.heightSubmitDelay);

      this.heightSubmitDelay = setTimeout(() => {
        if (this.heightFieldState === AnimationState.Countdown) {
          this.submitHeightValue();
        }
      }, DEFAULT_INPUT_FIELD_PROGRESS_TIMER);
    } else {
      this.heightFieldAnimationStateManager.toIdle();
    }
  }

  private async submitHeightValue(): Promise<void> {
    this.heightFieldAnimationStateManager.toSubmitting();
    const height = this.settingsForm.controls.height.value;
    await this.settingsService.saveSelectedChapter({ height: Number(height) });
    this.heightPreviousValue = Number(height);
  }

  private applySettingsToForm(): void {
    const settings = this.settingsService.settings$$();
    if (!settings) return;

    this.settingsForm.patchValue(
      {
        selectedChapterFood: settings.selectedChapterFood,
        selectedChapterMoney: settings.selectedChapterMoney,
        darkTheme: settings.darkTheme,
        height: String(settings.height),
      },
      { emitEvent: false },
    );

    this.heightPreviousValue = Number(settings.height);
  }

  private blockFieldsOnRequestsStatusChanes(): void {
    const selectedChapterFoodRequestStatus = this.settingsService.requestStatus.selectedChapterFood();
    if (selectedChapterFoodRequestStatus === RequestStatus.InProgress) {
      this.settingsForm.controls.selectedChapterFood.disable();
    } else {
      this.settingsForm.controls.selectedChapterFood.enable();
    }

    const selectedChapterMoneyRequestStatus = this.settingsService.requestStatus.selectedChapterMoney();
    if (selectedChapterMoneyRequestStatus === RequestStatus.InProgress) {
      this.settingsForm.controls.selectedChapterMoney.disable();
    } else {
      this.settingsForm.controls.selectedChapterMoney.enable();
    }

    const darkThemeRequestStatus = this.settingsService.requestStatus.darkTheme();
    if (darkThemeRequestStatus === RequestStatus.InProgress) {
      this.settingsForm.controls.darkTheme.disable();
    } else {
      this.settingsForm.controls.darkTheme.enable();
    }

    const heightRequestStatus = this.settingsService.requestStatus.height();
    if (heightRequestStatus === RequestStatus.InProgress) {
      this.settingsForm.controls.height.disable();
      this.heightFieldAnimationStateManager.toSubmitting();
    } else if (heightRequestStatus === RequestStatus.Success) {
      this.settingsForm.controls.height.enable();
      this.heightFieldAnimationStateManager.toSuccess();
    } else if (heightRequestStatus === RequestStatus.Error) {
      this.settingsForm.controls.height.enable();
      this.heightFieldAnimationStateManager.toError();
    }
  }
}
