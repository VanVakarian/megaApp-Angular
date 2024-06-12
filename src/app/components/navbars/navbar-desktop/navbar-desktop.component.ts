import { Component, OnInit } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';
import { DarkSwitchComponent } from 'src/app/components/settings/dark-switch/dark-switch.component';
import { Settings } from 'src/app/shared/interfaces';

type DesktopMenuButton = {
  label: string;
  link: string | string[];
  chapterSettingName?: string;
};

@Component({
  selector: 'app-navbar-desktop',
  standalone: true,
  imports: [NgClass, NgFor, RouterLink, MatButtonModule, DarkSwitchComponent],
  templateUrl: './navbar-desktop.component.html',
})
export class NavbarDesktopComponent implements OnInit {
  buttons: DesktopMenuButton[] = [
    { label: 'Дневник питания', link: ['/food', ''], chapterSettingName: 'selectedChapterFood' },
    { label: 'Дневник финансов', link: '/money', chapterSettingName: 'selectedChapterMoney' },
  ];
  public buttonSettings: DesktopMenuButton = { label: 'Настройки', link: '/settings' };

  constructor(
    public authService: AuthService,
    public settingsService: SettingsService,
    public router: Router,
  ) {}

  ngOnInit(): void {}

  isButtonVisible(button: DesktopMenuButton): boolean {
    const chapterName: keyof Settings = button.chapterSettingName as keyof Settings;
    const chapterSelected = this.settingsService.settings$$()[chapterName];
    return chapterSelected;
  }

  isRouteActive(link: string | string[]): boolean {
    const currentUrl = this.router.url;
    const buttonUrl = Array.isArray(link) ? link[0] : link;
    const cleanedButtonUrl = buttonUrl.startsWith('/') ? buttonUrl.substring(1) : buttonUrl; // Убираем начальный слэш, если он есть
    return currentUrl.includes(cleanedButtonUrl);
  }
}
