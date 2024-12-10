import { ElementRef, Injectable, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { catchError, map, Observable, of, Subject, tap } from 'rxjs';

import {
  Catalogue,
  CatalogueEntry,
  Diary,
  FormattedDiary,
  DiaryEntryEdit,
  ServerResponse,
  CatalogueIds,
  CatalogueId,
  ServerResponseWithDiaryId,
  ServerResponseWithCatalogueEntry,
  DiaryEntry,
  FormattedDiaryEntry,
} from 'src/app/shared/interfaces';
import { getTodayIsoNoTimeNoTZ } from 'src/app/shared/utils';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  // public selectedDayIso$$: WritableSignal<string> = signal('2024-06-29');
  public diary$$: WritableSignal<Diary> = signal({});
  public diaryFormatted$$: Signal<FormattedDiary> = computed(() => this.prepDiary());

  public selectedDayIso$$: WritableSignal<string> = signal(getTodayIsoNoTimeNoTZ());
  public days$$: Signal<string[]> = computed(() => Object.keys(this.diary$$()));

  public catalogue$$: WritableSignal<Catalogue> = signal({});
  public catalogueMyIds$$: WritableSignal<CatalogueIds> = signal([]);
  public catalogueSortedListSelected$$: Signal<CatalogueEntry[]> = computed(() => this.prepCatalogueSortedListSeparate(true)); // prettier-ignore
  public catalogueSortedListLeftOut$$: Signal<CatalogueEntry[]> = computed(() => this.prepCatalogueSortedListSeparate(false)); // prettier-ignore

  public diaryEntryClickedFocus$ = new Subject<number>();
  public diaryEntryClickedScroll$ = new Subject<ElementRef>();

  public postRequestResult$ = new Subject<ServerResponse>();

  constructor(private http: HttpClient) {
    effect(() => { console.log('DIARY has been updated:', this.diary$$()); }); // prettier-ignore
    effect(() => { console.log('FORMATTED DIARY has been updated:', this.diaryFormatted$$()); }); // prettier-ignore
    effect(() => { console.log('SELECTED DAY has been updated:', this.selectedDayIso$$()); }); // prettier-ignore
    effect(() => { console.log('DAYS have been updated:', this.days$$()); }); // prettier-ignore
    effect(() => { console.log('CATALOGUE have been updated:', this.catalogue$$()); }); // prettier-ignore
    effect(() => { console.log('CATALOGUE MY IDS have been updated:', this.catalogueMyIds$$()); }); // prettier-ignore
    effect(() => { console.log('CATALOGUE SORTED LIST SELECTED have been updated:', this.catalogueSortedListSelected$$()); }); // prettier-ignore
    effect(() => { console.log('CATALOGUE SORTED LIST LEFT OUT have been updated:', this.catalogueSortedListLeftOut$$()); }); // prettier-ignore
  }

  ///// INIT ///////////////////////////////////////////////////////////////////

  private prepDiary(): FormattedDiary {
    const formattedDiary: FormattedDiary = {};
    if (Object.keys(this.catalogue$$()).length === 0) return formattedDiary; // postpone formatting Diary if there is no catalogue yet

    for (const dateISO in this.diary$$()) {
      // console.log('date', dateIso);
      formattedDiary[dateISO] = {
        food: {},
        bodyWeight: this.diary$$()[dateISO].bodyWeight,
        targetKcals: this.diary$$()[dateISO].targetKcals,
        kcalsEaten: 0,
        kcalsPercent: 0,
      };

      for (const id in this.diary$$()[dateISO].food) {
        const entry = this.diary$$()[dateISO].food[id];
        const kcals = Math.round(
          (this.catalogue$$()[entry.foodCatalogueId]?.kcals ?? 0) * (entry.foodWeight / 100) * 1,
        );
        const percent = (kcals / this.diary$$()[dateISO].targetKcals) * 100;

        const formattedEntry: FormattedDiaryEntry = {
          id: Number(id),
          dateISO: entry.dateISO,
          foodCatalogueId: entry.foodCatalogueId,
          foodWeight: entry.foodWeight,
          history: entry.history || [],
          foodName: this.catalogue$$()[entry.foodCatalogueId]?.name || '',
          foodKcals: kcals,
          foodPercent: `${Math.floor(percent) < 100 ? percent.toFixed(1) : Math.round(percent).toString()}`,
          foodKcalPercentageOfDaysNorm: percent,
        };

        formattedDiary[dateISO].food[id] = formattedEntry;
        formattedDiary[dateISO].kcalsEaten += kcals;
        formattedDiary[dateISO].kcalsPercent += percent;
      }
    }
    return formattedDiary;
  }


  private prepCatalogueSortedListSeparate(selected: boolean): CatalogueEntry[] {
    return Object.values(this.catalogue$$())
      .filter((item) =>
        selected ? this.catalogueMyIds$$().includes(item.id) : !this.catalogueMyIds$$().includes(item.id),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  public getFoodDiaryFullUpdateRange(dateIso?: string, offset?: number): Observable<Diary> {
    // this.extendDates(dateIso, offset);
    const paramsStr = `date=${dateIso ?? getTodayIsoNoTimeNoTZ()}&offset=${offset ?? 7}`;
    return this.http.get<Diary>(`/api/food/diary-full-update?${paramsStr}`).pipe(
      tap((response: Diary) => {
        this.diary$$.set(response);
      }),
    );
  }

  ///// DIARY //////////////////////////////////////////////////////////////////

  public createDiaryEntry(diaryEntry: DiaryEntry): Observable<ServerResponseWithDiaryId> {
    return this.http.post<ServerResponseWithDiaryId>('/api/food/diary/', diaryEntry).pipe(
      tap((response: ServerResponseWithDiaryId) => {
        if (response?.result && response?.diaryId) {
          const diaryEntryId: number = response.diaryId;
          console.log('response', response, diaryEntryId);
          this.updateDiaryEntryWithNewValues(diaryEntryId, diaryEntry);
        } else {
          // console.error('Ошибка при обновлении записи в дневнике питания');
        }
      }),
    );
  }

  public editDiaryEntry(diaryEntry: DiaryEntry): Observable<ServerResponseWithDiaryId> {
    return this.http.put<ServerResponseWithDiaryId>('/api/food/diary', diaryEntry).pipe(
      tap((response: ServerResponseWithDiaryId) => {
        if (response?.result && response?.diaryId) {
          const diaryEntryId: number = response.diaryId;
          this.updateDiaryEntryWithNewValues(diaryEntryId, diaryEntry);
        } else {
          // console.error('Ошибка при обновлении записи в дневнике питания');
        }
      }),
    );
  }

  private updateDiaryEntryWithNewValues(diaryEntryId: number, diaryEntry: DiaryEntry) {
    this.diary$$.update((diary) => {
      const selectedDay = this.selectedDayIso$$();
      const updatedDiary = { ...diary };
      const updatedDay = { ...updatedDiary[selectedDay] };
      const updatedFood = { ...updatedDay.food };
      // Creating new food entry if there is none with this id (in case of new food)
      if (!updatedFood[diaryEntryId]) {
        updatedFood[diaryEntryId] = {
          id: diaryEntryId,
          dateISO: selectedDay,
          foodCatalogueId: diaryEntry.foodCatalogueId,
          foodWeight: diaryEntry.foodWeight,
          history: [],
        };
      }
      // Updating existing or newly created entry
      updatedFood[diaryEntryId] = {
        ...updatedFood[diaryEntryId],
        foodWeight: diaryEntry.foodWeight,
        history: [...updatedFood[diaryEntryId].history, ...diaryEntry.history]
      };
      updatedDay.food = updatedFood;
      updatedDiary[selectedDay] = updatedDay;
      return updatedDiary;
    });
  }

  // extendDates(middleDateIso: string, daysOffset: number): void {
  //   const dateSet = new Set(this.days$$());
  //   const middleDay = new Date(middleDateIso);
  //   for (let i = -daysOffset; i <= daysOffset; i++) {
  //     const currentDate = new Date(middleDay);
  //     currentDate.setDate(middleDay.getDate() + i);
  //     dateSet.add(currentDate.toISOString().split('T')[0]);
  //   }
  //   const sortedDates = Array.from(dateSet).sort();
  //   this.days$$.set(sortedDates);
  // }

  // getDatesOutOfDiary() {
  //   return Object.keys(this.diary$$());
  // }

  public getCatalogueEntries(): Observable<Catalogue> {
    return this.http.get<Catalogue>('/api/food/catalogue').pipe(
      tap((response: Catalogue) => {
        console.log('response', response);
        this.catalogue$$.set(response);
      }),
    );
  }

  public createNewCatalogueEntry(foodName: string, foodKcals: number): Observable<number | null> {
    return this.http.post<ServerResponseWithCatalogueEntry>('/api/food/catalogue/', { foodName, foodKcals }).pipe(
      map((response) => {
        if (response.result && response.id) {
          this.addFoodEntryToCatalogue(foodName, foodKcals, response.id);
          this.addFoodIdToUserCatalogue(response.id);
          return response.id;
        }
        return null;
      }),
      catchError((error) => {
        console.warn('Error adding user food item:', error);
        return of(null);
      }),
    );
  }

  private addFoodEntryToCatalogue(foodName: string, foodKcals: number, newId: number): void {
    this.catalogue$$.update((catalogue) => {
      const newCatalogueEntry: CatalogueEntry = {
        id: newId,
        name: foodName,
        kcals: foodKcals,
      };
      return { ...catalogue, [newId]: newCatalogueEntry };
    });
  }

  public editCatalogueEntry(foodId: number, foodName: string, foodKcals: number): Observable<boolean> {
    return this.http
      .put<ServerResponseWithCatalogueEntry>('/api/food/catalogue/', { foodId, foodName, foodKcals })
      .pipe(
        map((response) => {
          if (response.result) {
            this.catalogue$$.update((catalogue) => {
              return {
                ...catalogue,
                [foodId]: {
                  id: foodId,
                  name: foodName,
                  kcals: foodKcals,
                },
              };
            });
          }
          return response.result;
        }),
        catchError((error) => {
          console.warn('Error updating user food item:', error);
          return of(false);
        }),
      );
  }

  public getMyCatalogueEntries(): Observable<CatalogueIds> {
    return this.http.get<CatalogueIds>('/api/food/user-catalogue').pipe(
      tap((response: CatalogueIds) => {
        this.catalogueMyIds$$.set(response);
      }),
    );
  }

  public pickUserFoodId(foodId: number): Observable<boolean> {
    return this.http.put<ServerResponse>('/api/food/user-catalogue/pick/', { foodId: foodId }).pipe(
      map((response) => {
        if (response.result) this.addFoodIdToUserCatalogue(foodId);
        return response.result;
      }),
      catchError((error) => {
        console.warn('Error deleting user food id:', error);
        return of(false);
      }),
    );
  }

  private addFoodIdToUserCatalogue(foodId: number): void {
    this.catalogueMyIds$$.update((foodIds) => {
      return [...foodIds, foodId];
    });
  }

  public dismissUserFoodId(foodId: number): Observable<boolean> {
    return this.http.put<ServerResponse>('/api/food/user-catalogue/dismiss/', { foodId: foodId }).pipe(
      map((response) => {
        if (response.result) this.removeFoodIdFromCatalogue(foodId);
        return response.result;
      }),
      catchError((error) => {
        console.warn('Error deleting user food id:', error);
        return of(false);
      }),
    );
  }

  private removeFoodIdFromCatalogue(foodId: number): void {
    this.catalogueMyIds$$.update((foodIds) => foodIds.filter((id) => id !== foodId));
  }
}
