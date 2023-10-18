import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataSharingService {
  currenciesChanged: EventEmitter<void> = new EventEmitter<void>();
  accountsChanged: EventEmitter<void> = new EventEmitter<void>();
  banksChanged: EventEmitter<void> = new EventEmitter<void>();
  categoriesChanged: EventEmitter<void> = new EventEmitter<void>();
}
