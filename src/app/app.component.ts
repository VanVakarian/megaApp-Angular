import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { Subscription, debounceTime, fromEvent, merge, throttleTime } from 'rxjs';

import { NavbarMobileComponent } from './components/navbars/navbar-mobile/navbar-mobile.component';
import { NavbarDesktopComponent } from './components/navbars/navbar-desktop/navbar-desktop.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarDesktopComponent, NavbarMobileComponent, RouterOutlet, MatNativeDateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class MainAppComponent implements OnInit, OnDestroy {
  title = 'megaApp';
  private scrollSubscription: Subscription | undefined;
  @ViewChild('header') header!: ElementRef;

  constructor(private dateAdapter: DateAdapter<Date>) {}

  ngOnInit(): void {
    this.dateAdapter.setLocale('ru-RU');
    this.dateAdapter.getFirstDayOfWeek = () => 1;

    // Totally overkill method to detect when to put shadow on fixed navbar, but that shadow looks too nice...
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
