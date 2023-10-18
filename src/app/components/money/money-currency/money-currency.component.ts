import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Currency } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-money-currency',
  templateUrl: './money-currency.component.html',
  styleUrls: ['./money-currency.component.scss'],
})
export class MoneyCurrencyComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}
  token = this.auth.getToken();

  currencies: Currency[] = [];
  currenciesDivOpenState: { [key: string]: boolean } = { newCurrencyDiv: false };
  @ViewChild('newCurrencyDiv') newCurrencyDiv!: ElementRef;

  toggleTabNew() {
    this.closeEveryDiv('newCurrencyDiv');
    this.currenciesDivOpenState['newCurrencyDiv'] = !this.currenciesDivOpenState['newCurrencyDiv'];
  }

  toggleTabEdit(currency: { id: number }) {
    const key = currency.id.toString();
    this.closeEveryDiv(key);
    this.currenciesDivOpenState[key] = !this.currenciesDivOpenState[key];
  }

  closeEveryDiv(key: string) {
    if (key === 'newCurrencyDiv' && this.currenciesDivOpenState[key] === true) {
      return;
    } else if (key !== 'newCurrencyDiv' && this.currenciesDivOpenState[key] === true) {
      return;
    } else {
      Object.keys(this.currenciesDivOpenState).forEach((key) => {
        this.currenciesDivOpenState[key] = false;
      });
    }
  }

  currencyRequest() {
    this.closeEveryDiv('other');
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
            console.error('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при запросе счетов', 'error');
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  ngOnInit(): void {
    this.currencyRequest();

    this.dataSharingService.currenciesChanged.subscribe(() => {
      this.currencyRequest();
    });
  }
}
