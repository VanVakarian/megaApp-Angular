import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Transaction } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-money-transactions',
  templateUrl: './money-transactions.component.html',
  styleUrls: ['./money-transactions.component.scss'],
  animations: [
    trigger('slideInAndOut', [
      state('left', style({ transform: 'translateX(0)', opacity: 1}), { params: { side: '' } }),
      state('right', style({ transform: 'translateX(0)', opacity: 1}), { params: { side: '' } }),
      state('void', style({ transform: 'translateX( {{ side }} )', opacity: 0}), { params: { side: ''} }),
      transition('void => left', [style({ transform: 'translateX(100%)', opacity: 0 }), animate('250ms ease-in-out')]),
      transition('left => void', [animate('250ms ease-in-out')]),
      transition('void => right', [style({ transform: 'translateX(-100%)', opacity: 0 }), animate('250ms ease-in-out')]),
      transition('right => void', [animate('250ms ease-in-out')]) 
    ]),
  ],
})
export class MoneyTransactionsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    // private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}
  token = this.auth.getToken();
  allTransactions: Transaction[] = [];

  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  currentIndex = 0;
  direction = 'left';
  side = '-100%'
  color = 'red';

  previous() {
    if (this.currentIndex > 0) {
      this.direction = 'right';
      this.side = '100%'
      this.currentIndex--;
    }
  }

  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.direction = 'left';
      this.side = '-100%'
      this.currentIndex++;
    }
  }

  activeDay: string = new Date().toISOString().split('T')[0];

  categoriesRequest() {
    if (this.token) {
      this.http
        .get<{ transaction_list: Transaction[] }>('/api/money/transaction', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            // this.notificationsService.addNotification('Ответ от сервера получен', 'success');
            this.allTransactions = response.transaction_list;
          },
          error: (error) => {
            console.log('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при запросе категорий', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  ngOnInit(): void {
    this.categoriesRequest();

  }

}
