import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { DateTimeFormatOptions, Transaction } from 'src/app/shared/interfaces';
import { slideInOutAnimation } from 'src/app/components/money/money-transactions/animations';
import { MoneyService } from 'src/app/services/money.service';
import { dateToIsoNoTimeNoTZ, divideNumberWithWhitespaces, splitNumber } from 'src/app/shared/utils';

@Component({
  selector: 'app-money-transactions',
  templateUrl: './money-transactions.component.html',
  styleUrls: ['./money-transactions.component.scss'],
  animations: [slideInOutAnimation],
})
export class MoneyTransactionsComponent implements OnInit {
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

  formatTransactionAmount(transactionId: number | null) {
    if (transactionId) {
      const accountId = this.moneyService.transactions$$()?.[transactionId].account_id;
      const currencyId = this.moneyService.accounts$$()?.[accountId].currency_id;
      const symbol = this.moneyService.currencies$$()?.[currencyId].symbol;
      const symbolPos = this.moneyService.currencies$$()?.[currencyId].symbol_pos;
      const whitespace = this.moneyService.currencies$$()?.[currencyId].whitespace ? ' ' : '';
      const amount = this.moneyService.transactions$$()?.[transactionId].amount;

      const [sign, integer, decimal] = splitNumber(String(amount));
      const integerDivided = divideNumberWithWhitespaces(integer);
      const amountPrepped = `${sign}${integerDivided}${decimal}`;

      return symbolPos == 'prefix'
        ? `${symbol}${whitespace}${amountPrepped}`
        : `${amountPrepped}${whitespace}${symbol}`;
    }
    return '';
  }

  formatTransactionNotes(transaction: Transaction) {
    const notes = transaction.notes;
    return `${notes ? ' (' : ''}${notes}${notes ? ')' : ''}`;
  }

  getOutgoingTransferAccountTitle(transactionId: number) {
    const accountId = this.moneyService.transactions$$()?.[transactionId].account_id;
    return this.moneyService.accounts$$()?.[accountId]['title'];
  }

  getIncomingTransferAccountTitle(incomingTransactionId: number | null) {
    const incomingTransactionAccountId = this.moneyService.transactions$$()?.[incomingTransactionId!].account_id;
    return this.moneyService.accounts$$()?.[incomingTransactionAccountId]['title'];
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

  ngOnInit(): void {}
}
