import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  isAuthenticated = this.auth.isAuthenticated();
  isMenuOpen: boolean = false;
  crossPicUrl = 'assets/x.png';
  linesPicUrl = 'assets/lines.png';
  buttonImage: string = this.linesPicUrl;

  constructor(public auth: AuthService) {
    auth.authChange.subscribe((isAuthed) => {
      this.isAuthenticated = isAuthed;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.buttonImage = this.isMenuOpen ? this.crossPicUrl : this.linesPicUrl;
  }

  closeMenu() {
    if (this.isMenuOpen) {
      this.isMenuOpen = !this.isMenuOpen;
      this.buttonImage = this.isMenuOpen ? this.crossPicUrl : this.linesPicUrl;
    }
  }

  public buttons = [
    { label: 'Ккал', link: '/kcals', requiresAuth: true, classColor: 'btn-blue', classActive: 'btn-blue-active' },
    { label: 'Обзор', link: '/dashboard', requiresAuth: true, classColor: 'btn-green', classActive: 'btn-green-active' },
    { label: 'Счета', link: '/accounts', requiresAuth: true, classColor: 'btn-green', classActive: 'btn-green-active' },
    { label: 'Сделки', link: '/transactions', requiresAuth: true, classColor: 'btn-green', classActive: 'btn-green-active' },
    { label: 'Настройки', link: '/settings', requiresAuth: true, classColor: 'btn-blue', classActive: 'btn-blue-active' },
    { label: 'Зайти', link: '/login', requiresAuth: false, classColor: 'btn-blue', classActive: 'btn-blue-active' },
    { label: 'Зарегистрироваться', link: '/register', requiresAuth: false, classColor: 'btn-blue', classActive: 'btn-blue-active' },
  ];
}
