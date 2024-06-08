import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';

import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, MatSlideToggleModule, MatChipsModule],
  templateUrl: './settings-form.component.html',
})
export class SettingsFormComponent implements OnInit {
  public settingsForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
  ) {
    effect(() => {
      this.settingsForm.patchValue({
        darkTheme: this.settingsService.settings$$().darkTheme,
        selectedChapterFood: this.settingsService.settings$$().selectedChapterFood,
        selectedChapterMoney: this.settingsService.settings$$().selectedChapterMoney,
      });
    });
  }

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      darkTheme: new FormControl(this.settingsService.settings$$().darkTheme),
      selectedChapterFood: new FormControl(this.settingsService.settings$$().selectedChapterFood),
      selectedChapterMoney: new FormControl(this.settingsService.settings$$().selectedChapterMoney),
    });

    this.settingsService.getSettings().subscribe();
  }

  toggleChapterSelection(chapter: string): void {
    const currentValue = this.settingsForm.get(chapter)?.value;
    this.settingsForm.patchValue({ [chapter]: !currentValue });
    this.onFormChange();
  }

  onFormChange(): void {
    this.settingsService.postSettings(this.settingsForm.value).subscribe();
  }
}
