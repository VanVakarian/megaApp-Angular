import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { DateAdapter, MatNativeDateModule } from '@angular/material/core';

import { Subscription, debounceTime, fromEvent, merge, throttleTime } from 'rxjs';

import { NavbarMobileComponent } from 'src/app/components/navbars/navbar-mobile/navbar-mobile.component';
import { NavbarDesktopComponent } from 'src/app/components/navbars/navbar-desktop/navbar-desktop.component';
import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NavbarDesktopComponent, NavbarMobileComponent, RouterOutlet, MatNativeDateModule],
  templateUrl: './app.component.html',
})
export class MainAppComponent implements OnInit, OnDestroy {
  title = 'megaApp';
  private scrollSubscription: Subscription | undefined;
  @ViewChild('header') header!: ElementRef;

  constructor(
    private dateAdapter: DateAdapter<Date>,
    public authService: AuthService,
    private settingsService: SettingsService,
  ) {
    this.authService.initCheckToken();
  }

  ngOnInit(): void {
    this.dateAdapter.setLocale('ru-RU');
    this.dateAdapter.getFirstDayOfWeek = () => 1;

    this.settingsService.getSettings().subscribe();

    // Totally overkill method to detect when to put shadow on fixed navbar, but that shadow looks sooo nice...
    const scroll$ = fromEvent(window, 'scroll');
    const throttledScroll$ = scroll$.pipe(throttleTime(200));
    const debouncedScroll$ = scroll$.pipe(debounceTime(10));
    this.scrollSubscription = merge(throttledScroll$, debouncedScroll$).subscribe(() => this.onScroll());
  }

  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  onScroll(): void {
    if (!this.header) {
      return;
    }
    const headerEl = this.header.nativeElement;
    if (window.scrollY > 0) {
      headerEl.classList.add('shadow-md');
    } else {
      headerEl.classList.remove('shadow-md');
    }
  }
}
