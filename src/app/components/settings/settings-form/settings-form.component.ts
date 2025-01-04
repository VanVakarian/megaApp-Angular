import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { SettingsService } from 'src/app/services/settings.service';
import { SelectedChapterNames } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatChipsModule,
  ],
  templateUrl: './settings-form.component.html',
})
export class SettingsFormComponent implements OnInit {
  public settingsForm: FormGroup;

  constructor(
    private settingsService: SettingsService,
    private fb: FormBuilder
  ) {
    this.settingsForm = this.fb.group({
      darkTheme: [this.settingsService.settings$$().darkTheme],
      selectedChapterFood: [this.settingsService.settings$$().selectedChapterFood],
      selectedChapterMoney: [this.settingsService.settings$$().selectedChapterMoney]
    });

    effect(() => {
      const settings = this.settingsService.settings$$();
      if (settings) {
        this.settingsForm.patchValue({
          darkTheme: settings.darkTheme,
          selectedChapterFood: settings.selectedChapterFood,
          selectedChapterMoney: settings.selectedChapterMoney
        }, { emitEvent: false });

        this.settingsService.applyTheme();
      }
    });
  }

  ngOnInit(): void {
    this.settingsForm.get('darkTheme')?.valueChanges.subscribe(value => {
      this.settingsService.settings$$.update(settings => ({
        ...settings,
        darkTheme: value
      }));
      this.settingsService.applyTheme();
      this.settingsService.saveSettings();
    });
  }

  toggleChapterSelection(chapter: SelectedChapterNames): void {
    const control = this.settingsForm.get(chapter as string);
    if (control) {
      const currentValue = control.value;
      control.setValue(!currentValue);

      this.settingsService.settings$$.update(settings => ({
        ...settings,
        [chapter]: !currentValue
      }));
      this.settingsService.saveSettings();
    }
  }
}
