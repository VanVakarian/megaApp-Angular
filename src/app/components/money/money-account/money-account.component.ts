import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { merge } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { AccountsServerResponse, BanksServerResponse, Currency } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-money-account',
  templateUrl: './money-account.component.html',
  styleUrls: ['./money-account.component.scss'],
})
export class MoneyAccountComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}
  token = this.auth.getToken();

  currencyList: Currency[] = [];
  bankList: BanksServerResponse[] = [];
  accounts: AccountsServerResponse[] = [];
  accountsDivOpenState: { [key: string]: boolean } = { newAccountDiv: false };
  @ViewChild('newAccountDiv') newAccountDiv!: ElementRef;

  toggleTabNew() {
    this.closeEveryDiv('newAccountDiv');
    this.accountsDivOpenState['newAccountDiv'] = !this.accountsDivOpenState['newAccountDiv'];
  }

  toggleTabEdit(account: { id: number }) {
    const key = account.id.toString();
    this.closeEveryDiv(key);
    this.accountsDivOpenState[key] = !this.accountsDivOpenState[key];
  }

  closeEveryDiv(key: string) {
    if (key === 'newAccountDiv' && this.accountsDivOpenState[key] === true) {
      return;
    } else if (key !== 'newAccountDiv' && this.accountsDivOpenState[key] === true) {
      return;
    } else {
      Object.keys(this.accountsDivOpenState).forEach((key) => {
        this.accountsDivOpenState[key] = false;
      });
    }
  }

  accountsRequest() {
    this.closeEveryDiv('other');
    if (this.token) {
      this.http
        .get<{
          bank_list: BanksServerResponse[];
          currency_list: Currency[];
          account_list: AccountsServerResponse[];
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
            console.error('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при запросе счетов', 'error');
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  // ngOnInit(): void {
  //   this.accountsRequest();
  //   // TODO: squash this shit:
  //   this.dataSharingService.currenciesChanged.subscribe(() => {
  //     this.accountsRequest();
  //   });
  //   this.dataSharingService.accountsChanged.subscribe(() => {
  //     this.accountsRequest();
  //   });
  //   this.dataSharingService.banksChanged.subscribe(() => {
  //     this.accountsRequest();
  //   });
  // }
  ngOnInit(): void {
    merge(
      this.dataSharingService.currenciesChanged,
      this.dataSharingService.accountsChanged,
      this.dataSharingService.banksChanged,
      this.dataSharingService.categoriesChanged
    ).subscribe(() => {
      this.accountsRequest();
    });

    this.accountsRequest();
  }
}
