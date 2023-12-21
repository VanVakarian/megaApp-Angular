import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { slideInOutAnimation } from 'src/app/shared/animations';
import { dateToIsoNoTimeNoTZ, generateDatesList } from 'src/app/shared/utils';
import { FoodService } from 'src/app/services/food.service';
import { FETCH_DAYS_RANGE_OFFSET } from 'src/app/shared/const';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-kcal-food',
  templateUrl: './kcal-food.component.html',
  styleUrls: ['./kcal-food.component.scss'],
  animations: [slideInOutAnimation],
})
export class KcalFoodComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('foodCont') condDiv!: ElementRef;
  @ViewChildren('foodName') nameDivs!: QueryList<ElementRef>;
  @ViewChildren('foodWeight') weightsDivs!: QueryList<ElementRef>;
  @ViewChildren('foodKcals') kcalsDivs!: QueryList<ElementRef>;
  @ViewChildren('foodPercent') percentsDivs!: QueryList<ElementRef>;

  direction: string = 'left';
  calendarSelectedDay: FormControl = new FormControl(new Date());
  today: Date = new Date();
  todayDate: number = this.today.setHours(0, 0, 0, 0);
  selectedDateMs: number = this.todayDate;
  selectedDateISO: string = dateToIsoNoTimeNoTZ(this.today.getTime());
  daysList: string[] = [];

  constructor(private cdRef: ChangeDetectorRef, public foodService: FoodService, private ngZone: NgZone) {}

  // VIEW FNs
  formatDate(dateIso: string): string {
    const date = new Date(dateIso);
    const result = date.toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' });
    return result.replace(result[0], result[0].toUpperCase());
  }

  setBackgroundStyle(percent: number) {
    return { background: `linear-gradient(to right, #c5d6ff ${percent}%, #ffffff00 ${percent}%)` };
  }

  // CARD SWITCHING AND CALENDAR
  onDatePicked(event: MatDatepickerInputEvent<Date>) {
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

  regenerateDaysList() {
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
  private adjustWidths() {
    this.ngZone.run(() => {
      const weightsWidth = this.getMaxWidth(this.weightsDivs);
      const kcalsWidth = this.getMaxWidth(this.kcalsDivs);
      const percentsWidth = this.getMaxWidth(this.percentsDivs);

      this.setWidth(this.weightsDivs, weightsWidth + 3);
      this.setWidth(this.kcalsDivs, kcalsWidth + 3);
      this.setWidth(this.percentsDivs, percentsWidth + 3);

      if (this.condDiv && this.condDiv.nativeElement) {
        const remainingWidth = this.condDiv.nativeElement.offsetWidth - weightsWidth - kcalsWidth - percentsWidth;
        this.setWidth(this.nameDivs, remainingWidth);
      }
    });
  }

  private getMaxWidth(elems: QueryList<ElementRef>): number {
    const widths = elems.map((elem) => elem.nativeElement.offsetWidth);
    return Math.max(...widths);
  }

  private setWidth(elems: QueryList<ElementRef>, width: number) {
    elems.forEach((elem) => {
      elem.nativeElement.style.width = `${width}px`;
    });
  }

  // LIFECYCLE HOOKS
  ngOnInit(): void {
    this.daysList = generateDatesList(this.selectedDateISO);
  }

  ngAfterViewInit() {
    // setting columns width
    combineLatest([this.weightsDivs.changes, this.kcalsDivs.changes, this.percentsDivs.changes]).subscribe(() =>
      this.adjustWidths()
    );
    setTimeout(() => this.adjustWidths(), 100);
  }

  ngOnDestroy(): void {}
}
