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
    { label: 'Ккал', link: '/kcals', requiresAuth: true, icon1Name: 'restaurant', icon2Name: '' },
    { label: 'Обзор', link: '/dashboard', requiresAuth: true, icon1Name: 'paid', icon2Name: 'remove_red_eye' },
    { label: 'Сделки', link: '/transactions', requiresAuth: true, icon1Name: 'paid', icon2Name: 'receipt_long' },
    { label: 'Управление', link: '/manage', requiresAuth: true, icon1Name: 'paid', icon2Name: 'account_balance' },
    { label: 'Настройки', link: '/settings', requiresAuth: true, icon1Name: 'settings', icon2Name: '' },
    { label: 'Войти', link: '/login', requiresAuth: false, icon1Name: 'login', icon2Name: '' },
    { label: 'Зарегистрироваться', link: '/register', requiresAuth: false, icon1Name: 'person_add', icon2Name: '' },
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
