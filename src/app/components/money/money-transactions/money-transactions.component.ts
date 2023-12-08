import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormControl } from '@angular/forms';

import { DateTimeFormatOptions, Transaction } from 'src/app/shared/interfaces';
import { slideInOutAnimation } from 'src/app/components/money/money-transactions/animations';
import { MoneyService } from 'src/app/services/money.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

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
  selectedDateISO: string = dateToIsoNoTimeNoTZ(this.today);
  selectedDate: Date = new Date();

  constructor(private cdRef: ChangeDetectorRef, public moneyService: MoneyService) {}

  getCategoryTitle(transaction: Transaction) {
    const categoryId = transaction.category_id;
    return this.moneyService.categories$$()?.[categoryId]['title'];
  }

  formatTransactionAmount(transaction: Transaction) {
    const accountId = transaction.account_id;
    const currencyId = this.moneyService.accounts$$()?.[accountId].currency_id;
    const symbol = this.moneyService.currencies$$()?.[currencyId].symbol;
    const whitespace = this.moneyService.currencies$$()?.[currencyId].whitespace ? ' ' : '';
    const amount = transaction.amount;
    const symbolPos = this.moneyService.currencies$$()?.[currencyId].symbol_pos;
    return symbolPos == 'prefix' ? `${symbol}${whitespace}${amount}` : `${amount}${whitespace}${symbol}`;
  }

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

  switchCurrentDay(shift: number) {
    const currIdx = Object.keys(this.moneyService.transactionsByDay$$()).indexOf(this.selectedDateISO);
    let keys = Object.keys(this.moneyService.transactionsByDay$$());

    if (keys[currIdx + shift] in this.moneyService.transactionsByDay$$()) {
      this.selectedDateISO = keys[currIdx + shift];
      this.selectedDate = new Date(this.selectedDateISO);
      this.dateForm.setValue(this.selectedDate);
    }
  }

  isFirstDay(): boolean {
    const keys = Object.keys(this.moneyService.transactionsByDay$$());
    return this.selectedDateISO === keys[0];
  }

  isLastDay(): boolean {
    const keys = Object.keys(this.moneyService.transactionsByDay$$());
    return this.selectedDateISO === keys[keys.length - 1];
  }

  formatDate(dateIso: string): string {
    const date = new Date(dateIso);
    const options: DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const result = date.toLocaleDateString('ru-RU', options);
    return result.replace(result[0], result[0].toUpperCase());
  }

  ngOnInit(): void { }
}
