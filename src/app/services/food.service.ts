import { HttpClient } from '@angular/common/http';
import { computed, effect, ElementRef, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { catchError, map, Observable, of, Subject, tap } from 'rxjs';

import {
  BodyWeight,
  Catalogue,
  CatalogueEntry,
  CatalogueIds,
  Diary,
  DiaryEntry,
  FormattedDiary,
  FormattedDiaryEntry,
  ServerResponseBasic,
  ServerResponseWithCatalogueEntry,
  ServerResponseWithDiaryId
} from 'src/app/shared/interfaces';
import { getTodayIsoNoTimeNoTZ } from 'src/app/shared/utils';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
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

  public postRequestResult$ = new Subject<ServerResponseBasic>();

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

  //                                                                        INIT

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
          foodPercent: `${ Math.floor(percent) < 100 ? percent.toFixed(1) : Math.round(percent).toString() }`,
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
    const paramsStr = `date=${ dateIso ?? getTodayIsoNoTimeNoTZ() }&offset=${ offset ?? 7 }`;
    return this.http.get<Diary>(`/api/food/diary-full-update?${ paramsStr }`).pipe(
      tap((response: Diary) => {
        this.diary$$.set(response);
      }),
    );
  }

  //                                                                       DIARY

  public createDiaryEntry(diaryEntry: DiaryEntry): Observable<ServerResponseWithDiaryId> {
    return this.http.post<ServerResponseWithDiaryId>('/api/food/diary/', diaryEntry).pipe(
      tap((response: ServerResponseWithDiaryId) => {
        if (response?.result) {
          diaryEntry.id = response.diaryId;
          this.updateDiaryEntryWithNewValues(diaryEntry);
        } else {
          console.error('Creation of diary entry failed');
        }
      }),
    );
  }

  public editDiaryEntry(diaryEntry: DiaryEntry): Observable<ServerResponseBasic> {
    return this.http.put<ServerResponseBasic>('/api/food/diary', diaryEntry).pipe(
      tap((response: ServerResponseBasic) => {
        if (response?.result) {
          this.updateDiaryEntryWithNewValues(diaryEntry);
        } else {
          console.error('Updating diary entry failed');
        }
      }),
    );
  }

  public deleteDiaryEntry(diaryEntryId: number): Observable<ServerResponseBasic> {
    return this.http.delete<ServerResponseBasic>(`/api/food/diary/${ diaryEntryId }`).pipe(
      tap((response: ServerResponseBasic) => {
        if (response?.result) {
          this.removeDiaryEntry(diaryEntryId);
        } else {
          console.error('Error deleting diary entry');
        }
      }),
    );
  }

  private updateDiaryEntryWithNewValues(updatedDiaryEntry: DiaryEntry): void {
    this.diary$$.update((oldDiary) => {
      const selectedDay = this.selectedDayIso$$();
      const updatedDiary = { ...oldDiary };
      const updatedDay = { ...updatedDiary[selectedDay] };
      const updatedFood = { ...updatedDay.food };

      // Creating new food entry if there is none with this id (in case of new food)
      if (!updatedFood[updatedDiaryEntry.id]) {
        updatedFood[updatedDiaryEntry.id] = {
          id: updatedDiaryEntry.id,
          dateISO: selectedDay,
          foodCatalogueId: updatedDiaryEntry.foodCatalogueId,
          foodWeight: updatedDiaryEntry.foodWeight,
          history: [],
        };
      }

      // Updating existing or newly created entry
      updatedFood[updatedDiaryEntry.id] = {
        ...updatedFood[updatedDiaryEntry.id],
        foodWeight: updatedDiaryEntry.foodWeight,
        history: [...updatedFood[updatedDiaryEntry.id].history, ...updatedDiaryEntry.history]
      };

      updatedDay.food = updatedFood;
      updatedDiary[selectedDay] = updatedDay;
      return updatedDiary;
    });
  }

  private removeDiaryEntry(diaryEntryId: number): void {
    this.diary$$.update((oldDiary) => {
      const selectedDay = this.selectedDayIso$$();
      const updatedDiary = { ...oldDiary };
      const updatedDay = { ...updatedDiary[selectedDay] };
      const updatedFood = { ...updatedDay.food };

      delete updatedFood[diaryEntryId];

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

  //                                                                   CATALOGUE

  public getCatalogueEntries(): Observable<Catalogue> {
    return this.http.get<Catalogue>('/api/food/catalogue').pipe(
      tap((response: Catalogue) => {
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
    return this.http.put<ServerResponseBasic>('/api/food/user-catalogue/pick/', { foodId: foodId }).pipe(
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
    return this.http.put<ServerResponseBasic>('/api/food/user-catalogue/dismiss/', { foodId: foodId }).pipe(
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

  //                                                                      WEIGHT

  public setUserBodyWeight(bodyWeight: BodyWeight): Observable<boolean> {
    return this.http.post<ServerResponseBasic>('/api/food/body_weight/', bodyWeight).pipe(
      map((response) => {
        if (response.result) {
          console.log('response', response);
          this.diary$$.update((diary) => {
            return {
              ...diary,
              [bodyWeight.dateISO]: {
                ...diary[bodyWeight.dateISO],
                bodyWeight: Number(bodyWeight.bodyWeight),
              },
            };
          });
        }
        return response.result;
      }),
      catchError((error) => {
        console.warn('Error setting user body weight:', error);
        return of(false);
      }),
    );
  }

}
