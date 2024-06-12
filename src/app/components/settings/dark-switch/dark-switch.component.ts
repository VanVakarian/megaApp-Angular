import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SettingsService } from 'src/app/services/settings.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dark-switch',
  standalone: true,
  imports: [NgIf, MatIconModule, MatButtonModule],
  templateUrl: './dark-switch.component.html',
})
export class DarkSwitchComponent implements OnInit {
  constructor(
    public settingsService: SettingsService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.settingsService.applyTheme();
  }

  public switchTheme(): void {
    this.settingsService.settings$$.update((settings) => ({
      ...settings,
      darkTheme: !this.settingsService.settings$$().darkTheme,
    }));
    this.settingsService.applyTheme();
    this.settingsService.saveSettings();
  }
}
