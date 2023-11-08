import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { merge } from 'rxjs';
import { MatAccordion } from '@angular/material/expansion';

import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Account, Bank, Currency } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-money-account',
  templateUrl: './money-account.component.html',
})
export class MoneyAccountComponent implements OnInit {
  @ViewChild('newAccountDiv') newAccountDiv!: ElementRef;
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  token = this.auth.getToken();
  currencyList: Currency[] = [];
  bankList: Bank[] = [];
  accounts: Account[] = [];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}

  accountExpanded(accountId: number) {
    this.dataSharingService.accountClicked$.emit(accountId);
  }

  closeAllPanels() {
    this.accordion.closeAll();
  }

  accountsRequest() {
    if (this.token) {
      this.http
        .get<{
          bank_list: Bank[];
          currency_list: Currency[];
          account_list: Account[];
        }>('/api/money/account', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            // this.notificationsService.addNotification('Ответ от сервера получен', 'success');
            this.bankList = response.bank_list;
            this.currencyList = response.currency_list;
            this.accounts = response.account_list;
          },
          error: (error) => {
            console.log('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при запросе счетов', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  ngOnInit(): void {
    this.accountsRequest();

    merge(
      this.dataSharingService.currenciesChanged$,
      this.dataSharingService.accountsChanged$,
      this.dataSharingService.banksChanged$,
      this.dataSharingService.categoriesChanged$
    ).subscribe(() => {
      this.accountsRequest();
      this.closeAllPanels();
    });
  }
}
