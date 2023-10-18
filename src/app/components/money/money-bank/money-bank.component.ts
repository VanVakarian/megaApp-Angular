import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { BanksServerResponse } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-money-bank',
  templateUrl: './money-bank.component.html',
  styleUrls: ['./money-bank.component.scss'],
})
export class MoneyBankComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}
  token = this.auth.getToken();

  banks: BanksServerResponse[] = [];
  banksDivOpenState: { [key: string]: boolean } = { newBankDiv: false };
  @ViewChild('newBankDiv') newBankDiv!: ElementRef;

  toggleTabNew() {
    this.closeEveryDiv('newBankDiv');
    this.banksDivOpenState['newBankDiv'] = !this.banksDivOpenState['newBankDiv'];
  }

  toggleTabEdit(bank: { id: number }) {
    const key = bank.id.toString();
    this.closeEveryDiv(key);
    this.banksDivOpenState[key] = !this.banksDivOpenState[key];
  }

  closeEveryDiv(key: string) {
    if (key === 'newBankDiv' && this.banksDivOpenState[key] === true) {
      return;
    } else if (key !== 'newBankDiv' && this.banksDivOpenState[key] === true) {
      return;
    } else {
      Object.keys(this.banksDivOpenState).forEach((key) => {
        this.banksDivOpenState[key] = false;
      });
    }
  }

  banksRequest() {
    this.closeEveryDiv('other');

    if (this.token) {
      this.http
        .get<{ bank_list: BanksServerResponse[] }>('/api/money/bank', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            // this.notificationsService.addNotification('Ответ от сервера получен', 'success');
            this.banks = response.bank_list;
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
    this.banksRequest();

    this.dataSharingService.banksChanged.subscribe(() => {
      this.banksRequest();
    });
  }
}
