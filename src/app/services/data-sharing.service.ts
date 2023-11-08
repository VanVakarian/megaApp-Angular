import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataSharingService {
  currenciesChanged$: EventEmitter<void> = new EventEmitter<void>();
  currencyClicked$: EventEmitter<number> = new EventEmitter<number>();
  
  banksChanged$: EventEmitter<void> = new EventEmitter<void>();
  bankClicked$: EventEmitter<number> = new EventEmitter<number>();

  accountsChanged$: EventEmitter<void> = new EventEmitter<void>();
  accountClicked$: EventEmitter<number> = new EventEmitter<number>();
  
  categoriesChanged$: EventEmitter<void> = new EventEmitter<void>();
  categoryClicked$: EventEmitter<number> = new EventEmitter<number>();
}
