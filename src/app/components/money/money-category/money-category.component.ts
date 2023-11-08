import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, effect, signal } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';

import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Category } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-money-category',
  templateUrl: './money-category.component.html',
})
export class MoneyCategoryComponent implements OnInit {
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  token = this.auth.getToken();
  categoryKind = [
    { key: 'expense', title: 'Расход' },
    { key: 'income', title: 'Доход' },
    { key: 'transfer', title: 'Перевод' },
  ];
  activeCategoryKindKey = 'expense';
  categories: Category[] = [];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}

  categoryExpanded(categoryId: number) {
    this.dataSharingService.categoryClicked$.emit(categoryId);
  }

  closeAllPanels() {
    this.accordion.closeAll();
  }

  categoriesRequest() {
    if (this.token) {
      this.http
        .get<{ category_list: Category[] }>('/api/money/category', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            // this.notificationsService.addNotification('Ответ от сервера получен', 'success');
            this.categories = response.category_list;
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

    this.dataSharingService.categoriesChanged$.subscribe(() => {
      this.categoriesRequest();
    });
  }
}
