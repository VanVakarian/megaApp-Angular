import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Subscription } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { FoodService } from 'src/app/services/food.service';
import { KeyboardService } from 'src/app/services/keyboard.service';
import { dateToIsoNoTimeNoTZ } from 'src/app/shared/utils';

@Component({
  selector: 'app-diary-nav-buttons',
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './diary-nav-buttons.component.html',
  styleUrl: './diary-nav-buttons.component.scss',
})
export class DiaryNavButtonsComponent implements OnInit, OnDestroy {
  today: Date = new Date();
  todayDate: number = this.today.setHours(0, 0, 0, 0);
  selectedDateMs: number = this.todayDate;

  calendarSelectedDay: FormControl = new FormControl(new Date());

  private keyboardSubscription!: Subscription;

  constructor(
    private keyboardService: KeyboardService,
    private authService: AuthService,
    public foodService: FoodService,
  ) {
    this.keyboardSubscription = this.keyboardService.getKeyboardEvents$().subscribe((event) => {
      if (event.key === 'ArrowRight') {
        this.nextDay();
      } else if (event.key === 'ArrowLeft') {
        this.previousDay();
      }
    });
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  get selectedDateIso() {
    return this.foodService.selectedDayIso$$();
  }

  formatDate(dateIso: string): string {
    const date = new Date(dateIso);
    const result = date.toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' });
    return result[0].toUpperCase() + result.slice(1);
  }

  previousDay() {
    this.switchCurrentDay(-1);
  }

  nextDay() {
    if (!this.isLastDay()) {
      this.switchCurrentDay(1);
    }
  }

  switchCurrentDay(shift: number) {
    const newDay = new Date(this.selectedDateMs);
    newDay.setDate(newDay.getDate() + shift);
    this.selectedDateMs = newDay.getTime();
    this.foodService.selectedDayIso$$.set(dateToIsoNoTimeNoTZ(this.selectedDateMs));
    this.calendarSelectedDay.setValue(new Date(this.selectedDateMs));

    // this.regenerateDaysList();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.keyboardSubscription.unsubscribe();
  }

  onDatePicked(event: MatDatepickerInputEvent<Date>) {
    if (!event.value) {
      return;
    }

    const newDateMs = event.value.getTime();

    // this.cdRef.detectChanges();
    this.selectedDateMs = newDateMs;
    this.foodService.selectedDayIso$$.set(dateToIsoNoTimeNoTZ(newDateMs));
    // this.selectedDateISO = dateToIsoNoTimeNoTZ(newDateMs);

    // this.regenerateDaysList();
  }

  isLastDay(): boolean {
    return this.today.getTime() === this.selectedDateMs;
  }
}
