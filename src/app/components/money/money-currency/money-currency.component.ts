import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CurrencyServerResponse } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-money-currency',
  templateUrl: './money-currency.component.html',
  styleUrls: ['./money-currency.component.scss'],
})
export class MoneyCurrencyComponent implements OnInit {
  constructor(private http: HttpClient, public auth: AuthService) {}
  token = this.auth.getToken();

  currencies: CurrencyServerResponse[] = [];
  currenciesDivOpenState: { [key: string]: boolean } = { newCurrencyDiv: false };
  @ViewChild('newCurrencyDiv') newCurrencyDiv!: ElementRef;

  toggleTabNew() {
    this.closeEveryDiv('newCurrencyDiv');
    this.currenciesDivOpenState['newCurrencyDiv'] = !this.currenciesDivOpenState['newCurrencyDiv'];
  }

  toggleTabEdit(currency: { ticker: string }) {
    const key = currency.ticker;
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
        .get<{ currency_list: CurrencyServerResponse[] }>('/api/money/currency', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.currencies = response.currency_list;
          },
          error: (error) => {
            console.error('Ошибка при запросе:', error);
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
    }
  }

  ngOnInit(): void {
    this.currencyRequest();
  }
}
