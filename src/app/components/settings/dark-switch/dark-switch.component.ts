import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-dark-switch',
  standalone: true,
  imports: [NgIf, MatIconModule, MatButtonModule],
  templateUrl: './dark-switch.component.html',
})
export class DarkSwitchComponent implements OnInit {
  constructor(public settingsService: SettingsService) {}

  ngOnInit(): void {
    this.applyTheme();
  }

  public switchTheme(): void {
    this.settingsService.settings$$.update((settings) => ({
      ...settings,
      darkTheme: !this.settingsService.settings$$().darkTheme,
    }));
    this.applyTheme();
    this.settingsService.saveSettings();
  }

  private applyTheme(): void {
    if (this.settingsService.settings$$().darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
