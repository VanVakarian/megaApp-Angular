import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';

import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Currency } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-money-currency',
  templateUrl: './money-currency.component.html',
})
export class MoneyCurrencyComponent implements OnInit {
  @ViewChild('newCurrencyDiv') newCurrencyDiv!: ElementRef;
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  token = this.auth.getToken();
  currencies: Currency[] = [];
  currenciesDivOpenState: { [key: string]: boolean } = { newCurrencyDiv: false };

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}

  closeAllPanels() {
    this.accordion.closeAll();
  }

  currencyExpanded(currencyId: number) {
    this.dataSharingService.currencyClicked$.emit(currencyId);
  }

  currencyRequest() {
    if (this.token) {
      this.http
        .get<{ currency_list: Currency[] }>('/api/money/currency', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            // this.notificationsService.addNotification('Ответ от сервера получен', 'success');
            this.currencies = response.currency_list;
          },
          error: (error) => {
            console.log('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при запросе валют', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  ngOnInit(): void {
    this.currencyRequest();

    this.dataSharingService.currenciesChanged$.subscribe(() => {
      this.currencyRequest();
      this.closeAllPanels();
    });
  }
}
