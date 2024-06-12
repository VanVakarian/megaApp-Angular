import { Component, OnInit, effect } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';

import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, MatSlideToggleModule, MatChipsModule],
  templateUrl: './settings-form.component.html',
})
export class SettingsFormComponent implements OnInit {
  public darkTheme: boolean = false;
  public selectedChapterFood: boolean = false;
  public selectedChapterMoney: boolean = false;

  constructor(private settingsService: SettingsService) {
    effect(() => {
      this.darkTheme = settingsService.settings$$().darkTheme;
      this.selectedChapterFood = settingsService.settings$$().selectedChapterFood;
      this.selectedChapterMoney = settingsService.settings$$().selectedChapterMoney;
    });
  }

  ngOnInit(): void {}

  toggleDarkMode(): void {
    this.settingsService.settings$$.update((settings) => ({
      ...settings,
      darkTheme: this.darkTheme,
    }));
    this.settingsService.applyTheme();
    this.settingsService.saveSettings();
  }

  toggleChapterSelection(chapter: string): void {
    if (chapter === 'selectedChapterFood') {
      this.settingsService.settings$$.update((settings) => ({
        ...settings,
        selectedChapterFood: !this.selectedChapterFood,
      }));
    } else if (chapter === 'selectedChapterMoney') {
      this.settingsService.settings$$.update((settings) => ({
        ...settings,
        selectedChapterMoney: !this.selectedChapterMoney,
      }));
    }
    this.settingsService.saveSettings();
  }
}
