import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { SettingsService } from 'src/app/services/settings.service';
import { InputWithProgressComponent } from 'src/app/shared/components/input-with-progress/input-with-progress.component';
import { InputWithProgressSubmitData, SelectedChapterNames } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatChipsModule,
    InputWithProgressComponent,
  ],
  templateUrl: './settings-form.component.html',
})
export class SettingsFormComponent implements OnInit {
  public settingsForm: FormGroup;

  public heightValidators = [Validators.required, Validators.pattern(/^\d{1,3}$/)];

  constructor(
    private settingsService: SettingsService,
    private fb: FormBuilder,
  ) {
    this.settingsForm = this.fb.group({
      darkTheme: [this.settingsService.settings$$().darkTheme],
      selectedChapterFood: [this.settingsService.settings$$().selectedChapterFood],
      selectedChapterMoney: [this.settingsService.settings$$().selectedChapterMoney],
      height: [this.settingsService.settings$$().height, this.heightValidators],
    });

    effect(() => {
      const settings = this.settingsService.settings$$();
      if (settings) {
        this.settingsForm.patchValue(
          {
            darkTheme: settings.darkTheme,
            selectedChapterFood: settings.selectedChapterFood,
            selectedChapterMoney: settings.selectedChapterMoney,
            height: settings.height,
          },
          { emitEvent: false },
        );
        this.settingsService.applyTheme();
      }
    });
  }

  public ngOnInit(): void {
    this.settingsForm.get('darkTheme')?.valueChanges.subscribe((value) => {
      console.log('darkTheme', value);
      this.settingsService.settings$$.update((settings) => ({ ...settings, darkTheme: value }));
      this.settingsService.applyTheme();
      this.settingsService.saveSettings();
    });
  }

  public toggleChapterSelection(chapter: SelectedChapterNames): void {
    const control = this.settingsForm.get(chapter as string);
    if (control) {
      const currentValue = control.value;
      control.setValue(!currentValue);

      this.settingsService.settings$$.update((settings) => ({
        ...settings,
        [chapter]: !currentValue,
      }));
      this.settingsService.saveSettings();
    }
  }

  public async submitHeight(data: InputWithProgressSubmitData): Promise<void> {
    const height = data.value.replace(',', '.');
    this.settingsForm.patchValue({ height });
    this.settingsService.settings$$.update((settings) => ({
      ...settings,
      height: Number(height),
    }));

    try {
      await this.settingsService.saveSettings();
      data.resolve();
    } catch (error) {
      console.error(error);
      data.reject();
    }
  }
}
