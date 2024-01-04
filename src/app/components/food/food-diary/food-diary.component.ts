import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { animate, style, transition, trigger } from '@angular/animations';
import { combineLatest } from 'rxjs';

import { slideInOutAnimation } from 'src/app/shared/animations';
import { dateToIsoNoTimeNoTZ, generateDatesList } from 'src/app/shared/utils';
import { FoodService } from 'src/app/services/food.service';
import { FETCH_DAYS_RANGE_OFFSET } from 'src/app/shared/const';

@Component({
  selector: 'app-food-diary',
  templateUrl: './food-diary.component.html',
  styleUrls: ['./food-diary.component.scss'],
  animations: [
    slideInOutAnimation,
    trigger('flyInOut', [
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('0.15s ease-in', style({ transform: 'scale(1)' })),
      ]),
      // transition(':leave', [animate('0.5s ease-out', style({ transform: 'translateX(100%)' }))]),
    ]),
  ],
})
export class FoodDiaryComponent implements OnInit, AfterViewInit {
  @ViewChild('foodCont') contDiv!: ElementRef;
  @ViewChildren('foodName') nameDivs!: QueryList<ElementRef>;
  @ViewChildren('foodWeight') weightsDivs!: QueryList<ElementRef>;
  @ViewChildren('foodKcals') kcalsDivs!: QueryList<ElementRef>;
  @ViewChildren('foodPercent') percentsDivs!: QueryList<ElementRef>;

  direction: string = 'left';
  daysList: string[] = [];
  calendarSelectedDay: FormControl = new FormControl(new Date());

  today: Date = new Date();
  todayDate: number = this.today.setHours(0, 0, 0, 0);
  selectedDateMs: number = this.todayDate;
  selectedDateISO: string = dateToIsoNoTimeNoTZ(this.today.getTime());

  showFloatingWindow: boolean = false;

  constructor(private cdRef: ChangeDetectorRef, public foodService: FoodService, private ngZone: NgZone) {}

  // VIEW FNs
  formatDate(dateIso: string): string {
    const date = new Date(dateIso);
    const result = date.toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' });
    return result.replace(result[0], result[0].toUpperCase());
  }

  setBackgroundStyle(percent: number) {
    const percentCapped = percent <= 100 ? percent : 100;
    return {
      background: `linear-gradient(to right, #c5d6ff ${percentCapped}%, #ffffff00 ${percentCapped}%)`,
    };
  }

  formatSelectedDaysEatenPercent(): number {
    return Math.round(this.foodService.diaryFormatted$$()?.[this.selectedDateISO]?.['days_kcals_percent'] * 10) / 10;
  }

  // DIARY
  diaryEntryExpanded(diaryEntryId: number) {
    this.foodService.diaryEntryClicked$.emit(diaryEntryId);
  }

  onCloseEvent(): void {
    this.showFloatingWindow = false;
  }

  // CARD SWITCHING AND CALENDAR
  onDatePicked(event: MatDatepickerInputEvent<Date>): void {
    if (!event.value) {
      return;
    }

    const newDateMs = event.value.getTime();

    if (newDateMs > this.selectedDateMs) {
      this.direction = 'left';
    } else if (newDateMs < this.selectedDateMs) {
      this.direction = 'right';
    }

    this.cdRef.detectChanges();
    this.selectedDateMs = newDateMs;
    this.selectedDateISO = dateToIsoNoTimeNoTZ(newDateMs);

    this.regenerateDaysList();
  }

  next(): void {
    this.direction = 'left';
    this.cdRef.detectChanges();
    this.switchCurrentDay(1);
  }

  previous(): void {
    this.direction = 'right';
    this.cdRef.detectChanges();
    this.switchCurrentDay(-1);
  }

  switchCurrentDay(shift: number) {
    const newDay = new Date(this.selectedDateMs);
    newDay.setDate(newDay.getDate() + shift);
    this.selectedDateMs = newDay.getTime();
    this.selectedDateISO = dateToIsoNoTimeNoTZ(this.selectedDateMs);
    this.calendarSelectedDay.setValue(new Date(this.selectedDateMs));

    this.regenerateDaysList();
  }

  regenerateDaysList(): void {
    const dayIdx = this.daysList.indexOf(this.selectedDateISO);

    if (
      dayIdx < Math.floor((FETCH_DAYS_RANGE_OFFSET * 2) / 4) ||
      dayIdx > Math.ceil(((FETCH_DAYS_RANGE_OFFSET * 2) / 4) * 3)
    ) {
      this.daysList = generateDatesList(this.selectedDateISO);
      this.foodService.getFullUpdate(this.selectedDateISO);
    }
  }

  isLastDay(): boolean {
    return this.today.getTime() === this.selectedDateMs;
  }

  // COLUMN WIDH SETTING FNS
  private adjustWidths(): void {
    this.ngZone.run(() => {
      this.setWidth(this.weightsDivs);
      this.setWidth(this.kcalsDivs);
      this.setWidth(this.percentsDivs);

      const weightsWidth = this.getMaxWidth(this.weightsDivs);
      const kcalsWidth = this.getMaxWidth(this.kcalsDivs);
      const percentsWidth = this.getMaxWidth(this.percentsDivs);

      this.setWidth(this.weightsDivs, weightsWidth + 3);
      this.setWidth(this.kcalsDivs, kcalsWidth + 0);
      this.setWidth(this.percentsDivs, percentsWidth + 12);

      if (this.contDiv && this.contDiv.nativeElement) {
        const remainingWidth = this.contDiv.nativeElement.offsetWidth - weightsWidth - kcalsWidth - percentsWidth;
        this.setWidth(this.nameDivs, remainingWidth);
      }
    });
  }

  private getMaxWidth(elems: QueryList<ElementRef>): number {
    const widths = elems.map((elem) => elem.nativeElement.offsetWidth);
    return Math.max(...widths);
  }

  private setWidth(elems: QueryList<ElementRef>, width?: number): void {
    elems.forEach((elem) => {
      elem.nativeElement.style.width = width === undefined ? 'auto' : `${width}px`;
    });
  }

  // LIFECYCLE HOOKS
  ngOnInit(): void {
    this.daysList = generateDatesList(this.selectedDateISO);
  }

  ngAfterViewInit(): void {
    // setting columns width
    combineLatest([this.weightsDivs.changes, this.kcalsDivs.changes, this.percentsDivs.changes]).subscribe(() =>
      this.adjustWidths()
    );
    setTimeout(() => this.adjustWidths(), 100);
  }
}
