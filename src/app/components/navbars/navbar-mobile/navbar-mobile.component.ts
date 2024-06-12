import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';
import { Settings } from 'src/app/shared/interfaces';

type MobileMenuButton = {
  label: string;
  link: string | string[];
  chapterSettingName?: string;
  iconName: string;
  bgClass: string;
};

@Component({
  selector: 'app-navbar-mobile',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, NgClass, MatIconModule, MatButtonModule],
  templateUrl: './navbar-mobile.component.html',
  styleUrl: './navbar-mobile.component.scss',
  animations: [
    trigger('menuSlide', [
      state('closed', style({ transform: 'translateX(100%)' })),
      state('open', style({ transform: 'translateX(0)' })),
      transition('closed <=> open', [animate('250ms cubic-bezier(0.68, -0.6, 0.32, 1.6)')]),
    ]),
    trigger('fadeInOut', [
      state('fadeOut', style({ opacity: 0 })),
      state('fadeIn', style({ opacity: 0.75 })),
      transition('fadeOut <=> fadeIn', [animate('250ms ease-in-out')]),
    ]),
  ],
})
export class NavbarMobileComponent implements OnInit {
  public menuOpened: boolean = false;
  @ViewChild('fader') fader!: ElementRef;

  public buttons: MobileMenuButton[] = [
    { label: 'Дневник питания', link: ['/food', 'diary'], chapterSettingName: 'selectedChapterFood', iconName: 'restaurant', bgClass: 'food-bg' }, // prettier-ignore
    { label: 'Статистика', link: ['/food', 'stats'], chapterSettingName: 'selectedChapterFood', iconName: 'insights', bgClass: 'food-bg' }, // prettier-ignore
    { label: 'Каталог еды', link: ['/food', 'catalogue'], chapterSettingName: 'selectedChapterFood', iconName: 'menu_book', bgClass: 'food-bg' }, // prettier-ignore
    { label: 'Дневник финансов', link: '/money', chapterSettingName: 'selectedChapterMoney', iconName: 'remove_red_eye', bgClass: 'money-bg' }, // prettier-ignore
    { label: 'Настройки', link: '/settings', iconName: 'settings', bgClass: 'settings-bg' }, // prettier-ignore
    // { label: 'Обзор', link: '/money-dashboard', requiresAuth: true, iconName: 'remove_red_eye', bgClass: 'money-bg' }, // prettier-ignore
    // { label: 'Дневник операций', link: '/money-transactions', requiresAuth: true, iconName: 'receipt_long', bgClass: 'money-bg' }, // prettier-ignore
    // { label: 'Управление', link: '/money-manage', requiresAuth: true, iconName: 'account_balance', bgClass: 'money-bg' }, // prettier-ignore
    // { label: 'Войти', link: '/login', requiresAuth: false, iconName: 'login', bgClass: 'login-bg' }, // prettier-ignore
    // { label: 'Зарегистрироваться', link: '/register', requiresAuth: false, iconName: 'person_add', bgClass: 'register-bg' }, // prettier-ignore
  ];

  constructor(
    public authService: AuthService,
    private settingsService: SettingsService,
  ) {}

  public closeMenu(): void {
    this.menuOpened = false;
    this.fader.nativeElement.classList.add('hidden');
  }

  public toggleMenu(): void {
    this.menuOpened = !this.menuOpened;
    if (this.menuOpened) {
      this.fader.nativeElement.classList.remove('hidden');
    } else {
      setTimeout(() => {
        this.fader.nativeElement.classList.add('hidden');
      }, 250); // Waiting for the fadeOut animation to complete before hiding fader background
    }
  }

  ngOnInit(): void {}

  public isButtonVisible(button: MobileMenuButton): boolean {
    const chapterName: keyof Settings | undefined = button.chapterSettingName as keyof Settings;
    const chapterSelected = chapterName ? this.settingsService.settings$$()[chapterName] : true; // showing button if it doesn't have chapterSettingName
    return chapterSelected;
  }
}
