import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { AuthService } from 'src/app/services/auth.service';
import { DarkSwitchComponent } from 'src/app/components/settings/dark-switch/dark-switch.component';

@Component({
  selector: 'app-navbar-desktop',
  standalone: true,
  imports: [NgFor, RouterLink, MatButtonModule, DarkSwitchComponent],
  templateUrl: './navbar-desktop.component.html',
})
export class NavbarDesktopComponent implements OnInit {
  buttons = [
    { label: 'Дневник питания', link: ['/food', ''], requiresAuth: true, iconName: 'restaurant', bgClass: 'food-bg' }, // prettier-ignore
    { label: 'Дневник финансов', link: '/money', requiresAuth: true, iconName: 'remove_red_eye', bgClass: 'money-bg' }, // prettier-ignore
  ];
  buttonSettings = { label: 'Настройки', link: '/settings', requiresAuth: false, iconName: 'settings', bgClass: 'settings-bg' }; // prettier-ignore
  // buttons = [
  //   { label: 'Дневник питания', link: '/food-diary', requiresAuth: true, iconName: 'restaurant', bgClass: 'food-bg' }, // prettier-ignore
  //   { label: 'Статистика', link: '/food-stats', requiresAuth: true, iconName: 'insights', bgClass: 'food-bg' }, // prettier-ignore
  //   { label: 'Каталог еды', link: '/food-catalogue', requiresAuth: true, iconName: 'menu_book', bgClass: 'food-bg' }, // prettier-ignore
  //   { label: 'Обзор', link: '/money-dashboard', requiresAuth: true, iconName: 'remove_red_eye', bgClass: 'money-bg' }, // prettier-ignore
  //   { label: 'Дневник операций', link: '/money-transactions', requiresAuth: true, iconName: 'receipt_long', bgClass: 'money-bg' }, // prettier-ignore
  //   { label: 'Управление', link: '/money-manage', requiresAuth: true, iconName: 'account_balance', bgClass: 'money-bg' }, // prettier-ignore
  //   { label: 'Настройки', link: '/settings', requiresAuth: true, iconName: 'settings', bgClass: 'settings-bg' }, // prettier-ignore
  //   { label: 'Войти', link: '/login', requiresAuth: false, iconName: 'login', bgClass: 'login-bg' }, // prettier-ignore
  //   { label: 'Зарегистрироваться', link: '/register', requiresAuth: false, iconName: 'person_add', bgClass: 'register-bg' }, // prettier-ignore
  // ];

  constructor(public auth: AuthService) {}

  ngOnInit(): void {}
}
