import { computed, effect, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Catalogue, Coefficients, Diary, FormattedDiary, Stats, BodyWeight } from 'src/app/shared/interfaces';
import { NotificationsService } from 'src/app/services/notifications.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { dateToIsoNoTimeNoTZ } from 'src/app/shared/utils';
import { Subject } from 'rxjs';

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

type PayloadType = Diary | BodyWeight;
type WritableSignalTypes = Diary | Catalogue | Coefficients | Stats;

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  token = this.auth.getToken();
  currentDay: string = '';

  diary$$: WritableSignal<Diary> = signal({});
  catalogue$$: WritableSignal<Catalogue> = signal({});
  coefficients$$: WritableSignal<Coefficients> = signal({});

  diaryFormatted$$: Signal<FormattedDiary> = computed(() => this.formatDiary());

  stats$$: WritableSignal<Stats> = signal({});

  requestResults$ = new Subject<string>();

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private notificationsService: NotificationsService,
    private dataSharingService: DataSharingService
  ) {
    effect(() => { console.log('DIARY have been updated:', this.diary$$()); }); // prettier-ignore
    effect(() => { console.log('CATALOGUE have been updated:', this.catalogue$$()); }); // prettier-ignore
    effect(() => { console.log('COEFFICIENTS have been updated:', this.coefficients$$()); }); // prettier-ignore
    effect(() => { console.log('DIARY FORMATTED have been updated:', this.diaryFormatted$$()); }); // prettier-ignore
    effect(() => { console.log('STATS have been updated:', this.stats$$()); }); // prettier-ignore
  }

  formatDiary(): FormattedDiary {
    const formattedDiary: FormattedDiary = {};

    for (const date in this.diary$$()) {
      formattedDiary[date] = {
        food: {},
        body_weight: this.diary$$()[date].body_weight,
        target_kcals: this.diary$$()[date].target_kcals,
      };

      for (const id in this.diary$$()[date].food) {
        const entry = this.diary$$()[date].food[id];
        const foodName = this.catalogue$$()[entry.catalogue_id].name;
        const kcals = Math.round(
          this.catalogue$$()[entry.catalogue_id].kcals *
            (entry.food_weight / 100) *
            this.coefficients$$()[entry.catalogue_id]
        );
        const percent = Math.round((kcals / this.diary$$()[date].target_kcals) * 100);

        formattedDiary[date].food[id] = {
          ...entry,
          formatted_food_name: foodName,
          formatted_food_weight: `${entry.food_weight} г.`,
          formatted_food_kcals: `${kcals} ккал.`,
          formatted_food_percent: `${percent}%`,
          food_fraction_of_days_norm: percent,
        };
      }
    }

    return formattedDiary;
  }

  performRequest(
    method: HttpMethod,
    url: string,
    payload: PayloadType | null,
    resultVariables: WritableSignal<WritableSignalTypes>[] | null,
    responsePropertyNames: string[] | null,
    successMessage: string,
    errorMessage: string,
    callback?: () => void
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
        // TODO: 'any' is not the most elegant solution here, refactor to a better one
        next: (response: any) => {
          if (response && resultVariables && responsePropertyNames) {
            for (let i = 0; i < resultVariables.length; i++) {
              if (response[responsePropertyNames[i]]) {
                resultVariables[i].set(response[responsePropertyNames[i]]);
              }
            }
          }

          switch (method) {
            case 'GET':
              console.log(successMessage, response);
              // this.notificationsService.addNotification(successMessage, 'success');
              break;
            default:
              // console.log(successMessage, response);
              this.notificationsService.addNotification(successMessage, 'success');
          }

          if (callback) {
            callback();
          }
          this.requestResults$.next('ok');
        },
        error: (error) => {
          console.log(errorMessage, error);
          this.notificationsService.addNotification(errorMessage, 'error');
          this.requestResults$.next('error');
        },
      });
  }

  // MAIN //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getFullUpdate(day?: string): void {
    this.performRequest(
      HttpMethod.GET,
      `/api/kcal/full_update/${day ?? dateToIsoNoTimeNoTZ(new Date().getTime())}`,
      null,
      [this.diary$$, this.catalogue$$, this.coefficients$$],
      ['diary', 'catalogue', 'coefficients'],
      'Еда получена',
      'Ошибка при запросе еды'
    );
  }

  // getFoodUpdate(day: string): void {
  //   this.performRequest(
  //     HttpMethod.GET,
  //     `/api/kcal/food/${day}`,
  //     null,
  //     [this.diary$$],
  //     ['diary'],
  //     'Еда получена',
  //     'Ошибка при запросе еды'
  //   );
  // }

  // createCurrency(currency: Currency) {
  //   this.performRequest(
  //     HttpMethod.POST,
  //     '/api/money/currency',
  //     currency,
  //     null,
  //     null,
  //     'Валюта успешно cоздана',
  //     'Ошибка при создании валюты',
  //     this.currenciesChanged.bind(this)
  //   );
  // }

  // updateCurrency(currency: Currency): void {
  //   this.performRequest(
  //     HttpMethod.PUT,
  //     `/api/money/currency/${currency.id}`,
  //     currency,
  //     null,
  //     null,
  //     'Валюта успешно изменена',
  //     'Ошибка при изменении валюты',
  //     this.currenciesChanged.bind(this)
  //   );
  // }

  // deleteCurrency(currencyId: number): void {
  //   this.performRequest(
  //     HttpMethod.DELETE,
  //     `/api/money/currency/${currencyId}`,
  //     null,
  //     null,
  //     null,
  //     'Валюта успешно удалена',
  //     'Ошибка при удалении валюты',
  //     this.currenciesChanged.bind(this)
  //   );
  // }

  // BODY WEIGHT ///////////////////////////////////////////////////////////////////////////////////////////////////////

  postBodyWeight(bodyWeightObj: BodyWeight): void {
    this.performRequest(
      HttpMethod.POST,
      `/api/kcal/body_weight/`,
      bodyWeightObj,
      [],
      [],
      'Вес сохранён успешно',
      'Ошибка при запросе статистики'
    );
  }

  // STATS /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getStats(day?: string): void {
    this.performRequest(
      HttpMethod.GET,
      `/api/kcal/stats/${day ?? dateToIsoNoTimeNoTZ(new Date().getTime())}`,
      null,
      [this.stats$$],
      ['stats'],
      'Статистика получена',
      'Ошибка при запросе статистики'
    );
  }

  transactionsChanged(): void {
    this.dataSharingService.dataChanged$.emit();
    this.getFullUpdate(this.currentDay);
  }
}
