import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from 'src/app/services/auth/auth.service';
import { Account, Bank, Category, Currency } from 'src/app/shared/interfaces';
import { NotificationsService } from 'src/app/services/notifications.service';
import { DataSharingService } from './data-sharing.service';

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

type PayloadType = Currency | Bank | Account | Category | null;

@Injectable({
  providedIn: 'root',
})
export class MoneyService {
  token = this.auth.getToken();

  currencies: Currency[] = [];
  banks: Bank[] = [];
  accounts: Account[] = [];
  categories: Category[] = [];

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private notificationsService: NotificationsService,
    private dataSharingService: DataSharingService
  ) {}

  performRequest(
    method: HttpMethod,
    url: string,
    payload: PayloadType,
    resultVariable: any, // TODO: 'any' is not the most elegant solution, refactor to a better one
    responseProperty: any, // TODO: 'any' is not the most elegant solution, refactor to a better one
    notificationMessage: string,
    errorMessage: string,
    emitChanged?: () => void
  ): void {
    if (!this.token) {
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
      return;
    }

    this.http
      .request(method, url, {
        body: payload,
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .subscribe({
        next: (response: any) => {
          // TODO: 'any' is not the most elegant solution, refactor to a better one

          if (response && resultVariable && responseProperty && response[responseProperty]) {
            resultVariable.length = 0;
            resultVariable.push(...response[responseProperty]);
          }

          switch (method) {
            case 'GET':
              // console.log(notificationMessage, response);
              // this.notificationsService.addNotification(notificationMessage, 'success');
              break;
            default:
              // console.log(notificationMessage, response);
              this.notificationsService.addNotification(notificationMessage, 'success');
          }

          if (emitChanged) {
            emitChanged();
          }
        },
        error: (error) => {
          console.log(errorMessage, error);
          this.notificationsService.addNotification(errorMessage, 'error');
        },
      });
  }

  // CURRENCIES ////////////////////////////////////////////////////////////////////////////////////////////////////////

  getCurrencies(): void {
    this.performRequest(
      HttpMethod.GET,
      '/api/money/currency',
      null,
      this.currencies,
      'currencies_list',
      'Валюты получены',
      'Ошибка при запросе валют'
    );
  }

  createCurrency(currency: Currency) {
    this.performRequest(
      HttpMethod.POST,
      '/api/money/currency',
      currency,
      this.currencies,
      'currencies_list',
      'Валюта успешно cоздана',
      'Ошибка при создании валюты',
      this.currenciesChanged.bind(this)
    );
  }

  updateCurrency(currency: Currency): void {
    this.performRequest(
      HttpMethod.PUT,
      `/api/money/currency/${currency.id}`,
      currency,
      this.currencies,
      'currencies_list',
      'Валюта успешно изменена',
      'Ошибка при изменении валюты',
      this.currenciesChanged.bind(this)
    );
  }

  deleteCurrency(currencyId: number): void {
    this.performRequest(
      HttpMethod.DELETE,
      `/api/money/currency/${currencyId}`,
      null,
      this.currencies,
      'currencies_list',
      'Валюта успешно удалена',
      'Ошибка при удалении валюты',
      this.currenciesChanged.bind(this)
    );
  }

  currenciesChanged(): void {
    this.dataSharingService.dataChanged$.emit();
    this.getCurrencies();
  }

  // BANKS /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getBanks(): void {
    this.performRequest(
      HttpMethod.GET,
      '/api/money/bank',
      null,
      this.banks,
      'banks_list',
      'Банки получены',
      'Ошибка при запросе банков'
    );
  }

  createBank(bank: Bank): void {
    this.performRequest(
      HttpMethod.POST,
      '/api/money/bank',
      bank,
      this.banks,
      'banks_list',
      'Банк успешно cоздан',
      'Ошибка при создании банка',
      this.banksChanged.bind(this)
    );
  }

  updateBank(bank: Bank): void {
    this.performRequest(
      HttpMethod.PUT,
      `/api/money/bank/${bank.id}`,
      bank,
      this.banks,
      'banks_list',
      'Банк успешно изменён',
      'Ошибка при изменении банка',
      this.banksChanged.bind(this)
    );
  }

  deleteBank(bankId: number): void {
    this.performRequest(
      HttpMethod.DELETE,
      `/api/money/bank/${bankId}`,
      null,
      this.banks,
      'banks_list',
      'Банк успешно удалён',
      'Ошибка при удалении валюты',
      this.banksChanged.bind(this)
    );
  }

  banksChanged(): void {
    this.dataSharingService.dataChanged$.emit();
    this.getBanks();
  }

  // ACCOUNTS //////////////////////////////////////////////////////////////////////////////////////////////////////////

  getAccounts(): void {
    this.performRequest(
      HttpMethod.GET,
      '/api/money/account',
      null,
      this.accounts,
      'accounts_list',
      'Счета получены',
      'Ошибка при запросе счетов'
    );
  }

  createAccount(account: Account): void {
    this.performRequest(
      HttpMethod.POST,
      '/api/money/account',
      account,
      this.accounts,
      'accounts_list',
      'Счёт успешно cоздан',
      'Ошибка при создании счёта',
      this.accountsChanged.bind(this)
    );
  }

  updateAccount(account: Account): void {
    this.performRequest(
      HttpMethod.PUT,
      `/api/money/account/${account.id}`,
      account,
      this.accounts,
      'accounts_list',
      'Счёт успешно изменён',
      'Ошибка при изменении счёта',
      this.accountsChanged.bind(this)
    );
  }

  deleteAccount(accountId: number): void {
    this.performRequest(
      HttpMethod.DELETE,
      `/api/money/account/${accountId}`,
      null,
      this.accounts,
      'accounts_list',
      'Счёт успешно удалён',
      'Ошибка при удалении счёта',
      this.accountsChanged.bind(this)
    );
  }

  accountsChanged() {
    this.dataSharingService.dataChanged$.emit();
    this.getAccounts();
  }

  // CATEGORIES ////////////////////////////////////////////////////////////////////////////////////////////////////////

  getCategories(): void {
    this.performRequest(
      HttpMethod.GET,
      '/api/money/category',
      null,
      this.categories,
      'categories_list',
      'Категории получены',
      'Ошибка при запросе категорий'
    );
  }

  createCategory(category: Category): void {
    this.performRequest(
      HttpMethod.POST,
      '/api/money/category',
      category,
      this.categories,
      'categories_list',
      'Категория успешно cоздана',
      'Ошибка при создании категории',
      this.categoriesChanged.bind(this)
    );
  }

  updateCategory(category: Category): void {
    this.performRequest(
      HttpMethod.PUT,
      `/api/money/category/${category.id}`,
      category,
      this.categories,
      'categories_list',
      'Категория успешно изменена',
      'Ошибка при изменении категории',
      this.categoriesChanged.bind(this)
    );
  }

  deleteCategory(categoryId: number): void {
    this.performRequest(
      HttpMethod.DELETE,
      `/api/money/category/${categoryId}`,
      null,
      this.categories,
      'categories_list',
      'Категория успешно удаленa',
      'Ошибка при удалении категории',
      this.categoriesChanged.bind(this)
    );
  }

  categoriesChanged() {
    this.dataSharingService.dataChanged$.emit();
    this.getCategories();
  }
}
