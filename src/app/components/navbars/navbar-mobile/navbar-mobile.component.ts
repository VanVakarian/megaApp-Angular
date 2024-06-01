import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, computed, signal } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';

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

  public buttons = [
    { label: 'Дневник питания', link: ['/food', 'diary'], requiresAuth: true, iconName: 'restaurant', bgClass: 'food-bg' }, // prettier-ignore
    { label: 'Статистика', link: ['/food', 'stats'], requiresAuth: true, iconName: 'insights', bgClass: 'food-bg' }, // prettier-ignore
    { label: 'Каталог еды', link: ['/food', 'catalogue'], requiresAuth: true, iconName: 'menu_book', bgClass: 'food-bg' }, // prettier-ignore
    { label: 'Дневник финансов', link: '/money', requiresAuth: true, iconName: 'remove_red_eye', bgClass: 'money-bg' }, // prettier-ignore
  ];

  constructor(public auth: AuthService) {}

  closeMenu() {
    this.menuOpened = false;
    this.fader.nativeElement.classList.add('hidden');
  }

  toggleMenu(): void {
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
}
