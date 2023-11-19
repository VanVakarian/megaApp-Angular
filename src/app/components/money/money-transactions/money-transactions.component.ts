import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth/auth.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Transaction } from 'src/app/shared/interfaces';
import { slideInOutAnimation } from 'src/app/components/money/money-transactions/animations';

@Component({
  selector: 'app-money-transactions',
  templateUrl: './money-transactions.component.html',
  styleUrls: ['./money-transactions.component.scss'],
  animations: [slideInOutAnimation],
})
export class MoneyTransactionsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private notificationsService: NotificationsService,
    private cdRef: ChangeDetectorRef
  ) {}
  token = this.auth.getToken();
  allTransactions: Transaction[] = [];

  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  currentIndex = 0;
  direction = 'left';

  previous() {
    this.direction = 'right';
    this.cdRef.detectChanges();
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  next() {
    this.direction = 'left';
    this.cdRef.detectChanges();
    if (this.currentIndex < this.items.length - 1) {
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
