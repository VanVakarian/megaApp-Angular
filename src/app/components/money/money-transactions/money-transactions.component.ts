import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Transaction } from 'src/app/shared/interfaces';
import { slideInOutAnimation } from 'src/app/components/money/money-transactions/animations';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { MoneyService } from 'src/app/services/money.service';
import { MatCalendar, MatCalendarCellCssClasses, MatDatepickerInputEvent } from '@angular/material/datepicker';

import { ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormControl } from '@angular/forms';
import { dateToIsoNoTimeNoTZ } from 'src/app/shared/utils';

@Component({
  selector: 'app-money-transactions',
  templateUrl: './money-transactions.component.html',
  styleUrls: ['./money-transactions.component.scss'],
  animations: [slideInOutAnimation],
})
export class MoneyTransactionsComponent implements OnInit {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;

  direction: string = 'left';
  today: Date = new Date();
  dateForm: FormControl = new FormControl(new Date());
  // selectedDateISO: string = new Date().toISOString().split('T')[0];
  selectedDateISO: string = dateToIsoNoTimeNoTZ(this.today);
  selectedDate: Date = new Date();

  constructor(private cdRef: ChangeDetectorRef, public moneyService: MoneyService) {}

  onDatePicked(event: MatDatepickerInputEvent<Date>) {
    if (!event.value) {
      return;
    }

    const newDate: Date = event.value;

    if (newDate > this.selectedDate) {
      this.direction = 'left';
    } else if (newDate < this.selectedDate) {
      this.direction = 'right';
    }

    this.cdRef.detectChanges();
    this.selectedDate = newDate;
    this.selectedDateISO = dateToIsoNoTimeNoTZ(newDate);
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

  switchCurrentDay(lolkek: number) {
    const currIdx = Object.keys(this.moneyService.transactionsByDay).indexOf(this.selectedDateISO);
    let keys = Object.keys(this.moneyService.transactionsByDay);

    if (keys[currIdx + lolkek] in this.moneyService.transactionsByDay) {
      this.selectedDateISO = keys[currIdx + lolkek];
      this.selectedDate = new Date(this.selectedDateISO);
      this.dateForm.setValue(this.selectedDate);
    }
  }

  isFirstDay(): boolean {
    const keys = Object.keys(this.moneyService.transactionsByDay);
    return this.selectedDateISO === keys[0];
  }

  isLastDay(): boolean {
    const keys = Object.keys(this.moneyService.transactionsByDay);
    return this.selectedDateISO === keys[keys.length - 1];
  }

  ngOnInit(): void {
    // this.selectedDateISO = dateToIsoNoTimeNoTZ(this.today);
    // console.log(this.selectedDateISO);
    // setTimeout(() => {
    //   console.log(this.moneyService.transactions);
    //   console.log(this.moneyService.transactionDays);
    //   console.log(this.moneyService.transactionsByDay);
    //   console.log(Object.keys(this.moneyService.transactionsByDay).indexOf(this.selectedDateISO));
    // }, 500);
  }
}
