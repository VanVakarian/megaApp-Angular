import { computed, effect, EventEmitter, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Catalogue,
  Coefficients,
  Diary,
  FormattedDiary,
  Stats,
  BodyWeight,
  CatalogueEntry,
  ServerResponse,
  DiaryEntry,
} from 'src/app/shared/interfaces';
import { NotificationsService } from 'src/app/services/notifications.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { dateToIsoNoTimeNoTZ } from 'src/app/shared/utils';
import { Subject } from 'rxjs';

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

type PayloadType = Diary | BodyWeight | CatalogueEntry | DiaryEntry | null;
type CatalogueIds = number[];
type WritableSignalTypes = Diary | Catalogue | CatalogueIds | Coefficients | Stats;

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  token = this.auth.getToken();
  currentDay: string = '';

  diary$$: WritableSignal<Diary> = signal({});
  diaryFormatted$$: Signal<FormattedDiary> = computed(() => this.prepDiary());

  catalogue$$: WritableSignal<Catalogue> = signal({});
  catalogueSelectedIds$$: WritableSignal<CatalogueIds> = signal([]);

  catalogueSortedListSelected$$: Signal<CatalogueEntry[]> = computed(() => this.prepCatalogueSortedListSeparate(true));
  catalogueSortedListLeftOut$$: Signal<CatalogueEntry[]> = computed(() => this.prepCatalogueSortedListSeparate(false));

  coefficients$$: WritableSignal<Coefficients> = signal({});

  stats$$: WritableSignal<Stats> = signal({});

  postRequestResult$ = new Subject<ServerResponse>();

  diaryEntryClicked$: EventEmitter<number> = new EventEmitter<number>();

  constructor(private auth: AuthService, private http: HttpClient, private notificationsService: NotificationsService) {
    effect(() => { console.log('DIARY has been updated:', this.diary$$()); }); // prettier-ignore
    effect(() => { console.log('DIARY FORMATTED has been updated:', this.diaryFormatted$$()); }); // prettier-ignore
    effect(() => { console.log('CATALOGUE has been updated:', this.catalogue$$()); }); // prettier-ignore
    effect(() => { console.log('CATALOGUE SELECTED IDS has been updated:', this.catalogueSelectedIds$$()); }); // prettier-ignore
    effect(() => { console.log('CATALOGUE SORTED LIST SELECTED has been updated:', this.catalogueSortedListSelected$$()); }); // prettier-ignore
    effect(() => { console.log('CATALOGUE SORTED LIST LEFT OUT has been updated:', this.catalogueSortedListLeftOut$$()); }); // prettier-ignore
    effect(() => { console.log('COEFFICIENTS have been updated:', this.coefficients$$()); }); // prettier-ignore
    effect(() => { console.log('STATS have been updated:', this.stats$$()); }); // prettier-ignore
  }

  prepDiary(): FormattedDiary {
    const formattedDiary: FormattedDiary = {};

    for (const date in this.diary$$()) {
      formattedDiary[date] = {
        food: {},
        body_weight: this.diary$$()[date].body_weight,
        target_kcals: this.diary$$()[date].target_kcals,
        days_kcals_percent: 0,
      };

      for (const id in this.diary$$()[date].food) {
        const entry = this.diary$$()[date].food[id];
        const foodName = this.catalogue$$()[entry.catalogue_id].name;
        const kcals = Math.round(
          this.catalogue$$()[entry.catalogue_id].kcals *
            (entry.food_weight / 100) *
            this.coefficients$$()[entry.catalogue_id]
        );
        const percent = (kcals / this.diary$$()[date].target_kcals) * 100;

        formattedDiary[date].food[id] = {
          ...entry,
          formatted_food_name: foodName,
          formatted_food_weight: `${entry.food_weight} г.`,
          // formatted_food_kcals: `${kcals} ккал.`, // not sure if there should be 'ккал' postfix or not. It takes too much space, imo
          formatted_food_kcals: `${kcals}`,
          formatted_food_percent: `${Math.round(percent)}%`,
          food_kcal_percentage_of_days_norm: percent,
        };
        formattedDiary[date].days_kcals_percent += percent;
      }
    }
    return formattedDiary;
  }

  prepCatalogueSortedListSeparate(selected: boolean): CatalogueEntry[] {
    return Object.values(this.catalogue$$())
      .filter((item) =>
        selected ? this.catalogueSelectedIds$$().includes(item.id) : !this.catalogueSelectedIds$$().includes(item.id)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
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
      // this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
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
            for (const [i, resultVariable] of resultVariables.entries()) {
              if (response[responsePropertyNames[i]]) {
                resultVariable.set(response[responsePropertyNames[i]]);
              }
            }
          }

          switch (method) {
            case 'GET':
              // console.log('GET:', successMessage, response);
              // this.notificationsService.addNotification(successMessage, 'success');
              this.postRequestResult$.next({ ...(response as ServerResponse) });
              break;

            default:
              // console.log(successMessage, response);
              this.notificationsService.addNotification(successMessage, 'success');
              this.postRequestResult$.next({ ...(response as ServerResponse) });
          }

          if (callback) {
            callback();
          }
        },
        error: (error) => {
          console.log(errorMessage, error);
          this.notificationsService.addNotification(errorMessage, 'error');
          this.postRequestResult$.next({ result: false, value: '' });
        },
      });
  }

  // MAIN //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getFullUpdate(day?: string): void {
    this.performRequest(
      HttpMethod.GET,
      `/api/food/full_update/${day ?? dateToIsoNoTimeNoTZ(new Date().getTime())}`,
      null,
      [this.diary$$, this.catalogue$$, this.coefficients$$, this.catalogueSelectedIds$$],
      ['diary', 'catalogue', 'coefficients', 'personal_catalogue_ids'],
      'Полное обновление получено',
      'Ошибка при запросе полного обновления'
    );
  }

  // BODY WEIGHT ///////////////////////////////////////////////////////////////////////////////////////////////////////

  postBodyWeight(bodyWeight: BodyWeight): void {
    this.performRequest(
      HttpMethod.POST,
      `/api/food/body_weight/`,
      bodyWeight,
      [],
      [],
      'Вес сохранён успешно',
      'Ошибка при сохранении веса'
    );
  }

  // DIARY /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  postDiaryEntry(diaryEntry: DiaryEntry): void {
    this.performRequest(
      HttpMethod.POST,
      `/api/food/diary/`,
      diaryEntry,
      [],
      [],
      'Запись в дневник питания добавлена успешно',
      'Ошибка при добавлении записи в дневник питания'
    );
  }

  putDiaryEntry(diaryEntry: DiaryEntry): void {
    this.performRequest(
      HttpMethod.PUT,
      `/api/food/diary/`,
      diaryEntry,
      [],
      [],
      'Запись в дневнике питания обновлена успешно',
      'Ошибка при обновлении записи в дневнике питания'
    );
  }

  deleteDiaryEntry(diaryEntryId: number): void {
    this.performRequest(
      HttpMethod.DELETE,
      `/api/food/diary/${diaryEntryId}`,
      null,
      [],
      [],
      'Запись из дневника питания удалена успешно',
      'Ошибка при удалении записи из дневника питания'
    );
  }

  // CATALOGUE  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  postCatalogueEntry(catalogueEntry: CatalogueEntry): void {
    this.performRequest(
      HttpMethod.POST,
      `/api/food/catalogue/`,
      catalogueEntry,
      [],
      [],
      'Еда в каталог сохранёна успешно',
      'Ошибка при сохранении еды в каталог'
    );
  }

  // USER-CATALOGUE  ///////////////////////////////////////////////////////////////////////////////////////////////////

  putUserFoodId(foodId: number | string): void {
    this.performRequest(
      HttpMethod.PUT,
      `/api/food/user-catalogue/${foodId}`,
      null,
      [],
      [],
      'Еда в пользовательский каталог добавлена успешно',
      'Ошибка при сохранении еды в пользовательский каталог'
    );
  }

  deleteUserFoodId(foodId: number | string): void {
    this.performRequest(
      HttpMethod.DELETE,
      `/api/food/user-catalogue/${foodId}`,
      null,
      [],
      [],
      'Еда из пользовательского каталога удалена успешно',
      'Ошибка при удалении еды из пользовательского каталога'
    );
  }

  // STATS /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getStats(day?: string): void {
    this.performRequest(
      HttpMethod.GET,
      `/api/food/stats/${day ?? dateToIsoNoTimeNoTZ(new Date().getTime())}`,
      null,
      [this.stats$$],
      ['stats'],
      'Статистика получена',
      'Ошибка при запросе статистики'
    );
  }
}
