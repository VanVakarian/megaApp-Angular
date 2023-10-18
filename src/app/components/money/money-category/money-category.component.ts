import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Category } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-money-category',
  templateUrl: './money-category.component.html',
  styleUrls: ['./money-category.component.scss'],
})
export class MoneyCategoryComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}
  token = this.auth.getToken();

  categoryKind = [
    { key: 'income', name: 'Доход' },
    { key: 'expense', name: 'Расход' },
    { key: 'transfer', name: 'Перевод' },
  ];
  activeKindKey: string = 'income';
  kindClicked(kindKey: string) {
    this.activeKindKey = kindKey;
  }

  categories: Category[] = [];
  categoriesDivOpenState: { [key: string]: boolean } = { newCategoryDiv: false };
  addSubcategoryDivOpenState: { [key: string]: boolean } = {};
  @ViewChild('newCategoryDiv') newCategoryDiv!: ElementRef;

  onToggleAddSubCategoryClicked(category: Category) {
    // console.log(category);
    const key = category.id.toString();
    this.addSubcategoryDivOpenState[key] = !this.addSubcategoryDivOpenState[key];
  }

  toggleTabNew() {
    this.closeEveryDiv('newCategoryDiv');
    this.categoriesDivOpenState['newCategoryDiv'] = !this.categoriesDivOpenState['newCategoryDiv'];
  }

  toggleTabEdit(category: Category) {
    const key = category.id.toString();
    this.closeEveryDiv(key);
    this.categoriesDivOpenState[key] = !this.categoriesDivOpenState[key];
  }

  closeEveryDiv(key: string) {
    if (key === 'newCategoryDiv' && this.categoriesDivOpenState[key] === true) {
      return;
    } else if (key !== 'newCategoryDiv' && this.categoriesDivOpenState[key] === true) {
      return;
    } else {
      Object.keys(this.categoriesDivOpenState).forEach((key) => {
        this.categoriesDivOpenState[key] = false;
      });
    }
    Object.keys(this.categoriesDivOpenState).forEach((key) => {
      this.addSubcategoryDivOpenState[key] = false;
    });
  }

  categoriesRequest() {
    this.closeEveryDiv('other');

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
    this.categoriesRequest();

    this.dataSharingService.categoriesChanged.subscribe(() => {
      this.categoriesRequest();
    });
  }
}
