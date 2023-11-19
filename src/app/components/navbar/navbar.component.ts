import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Output() menuClosed = new EventEmitter();

  isAuthenticated = this.auth.isAuthenticated();
  public buttons = [
    { label: 'Ккал', link: '/kcals', requiresAuth: true, iconName: 'restaurant', bgClass: 'food-bg' },
    { label: 'Обзор', link: '/dashboard', requiresAuth: true, iconName: 'remove_red_eye', bgClass: 'money-bg' },
    { label: 'Сделки', link: '/transactions', requiresAuth: true, iconName: 'receipt_long', bgClass: 'money-bg' },
    { label: 'Управление', link: '/manage', requiresAuth: true, iconName: 'account_balance', bgClass: 'money-bg' },
    { label: 'Настройки', link: '/settings', requiresAuth: true, iconName: 'settings', bgClass: 'settings-bg' },
    { label: 'Войти', link: '/login', requiresAuth: false, iconName: 'login', bgClass: 'login-bg' },
    {
      label: 'Зарегистрироваться',
      link: '/register',
      requiresAuth: false,
      iconName: 'person_add',
      bgClass: 'register-bg',
    },
  ];

  constructor(public auth: AuthService) {
    auth.authChange.subscribe((isAuthed) => {
      this.isAuthenticated = isAuthed;
    });
  }

  closeMenu() {
    this.menuClosed.emit();
  }
}
