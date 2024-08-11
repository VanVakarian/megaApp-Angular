import { ElementRef, Injectable, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, Subject, tap } from 'rxjs';

import {
  Catalogue,
  CatalogueEntry,
  Diary,
  DiaryEntry,
  FormattedDiary,
  DiaryEntryEdit,
  ServerResponse,
} from 'src/app/shared/interfaces';
import { getTodayIsoNoTimeNoTZ } from 'src/app/shared/utils';

type CatalogueIds = string[];

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

  public diaryEntryClickedFocus$ = new Subject<string>();
  public diaryEntryClickedScroll$ = new Subject<ElementRef>();

  public postRequestResult$ = new Subject<ServerResponse>();

  constructor(private http: HttpClient) {
    effect(() => { console.log('DIARY has been updated:', this.diary$$()) }); // prettier-ignore
    effect(() => { console.log('FORMATTED DIARY has been updated:', this.diaryFormatted$$()) }); // prettier-ignore
    effect(() => { console.log('SELECTED DAY has been updated:', this.selectedDayIso$$()) }); // prettier-ignore
    effect(() => { console.log('DAYS have been updated:', this.days$$()) }); // prettier-ignore
    effect(() => { console.log('CATALOGUE have been updated:', this.catalogue$$()) }); // prettier-ignore
    effect(() => { console.log('CATALOGUE MY IDS have been updated:', this.catalogueMyIds$$()) }); // prettier-ignore
    effect(() => { console.log('CATALOGUE SORTED LIST SELECTED have been updated:', this.catalogueSortedListSelected$$()) }); // prettier-ignore
    effect(() => { console.log('CATALOGUE SORTED LIST LEFT OUT have been updated:', this.catalogueSortedListLeftOut$$()) }); // prettier-ignore
  }

  private prepDiary(): FormattedDiary {
    const formattedDiary: FormattedDiary = {};
    if (Object.keys(this.catalogue$$()).length === 0) return formattedDiary; // postpone formatting Diary if there is no catalogue yet

    for (const dateIso in this.diary$$()) {
      // console.log('date', dateIso);
      formattedDiary[dateIso] = {
        food: {},
        bodyWeight: this.diary$$()[dateIso].bodyWeight,
        // bodyWeight: 0,
        targetKcals: this.diary$$()[dateIso].targetKcals,
        // targetKcals: 0,
        kcalsEaten: 0,
        kcalsPercent: 0,
      };

      // console.log('this.diary$$()[date].food', this.diary$$()[date].food);
      for (const id in this.diary$$()[dateIso].food) {
        // console.log('this.diary$$()[dateIso].food', this.diary$$()[dateIso].food);
        const entry = this.diary$$()[dateIso].food[id];
        // console.log('entry', entry);
        // console.log('entry.foodCatalogueId', entry.foodCatalogueId);
        // const thisFoodsKcals = this.catalogue$$()[entry.foodCatalogueId]?.kcals;
        // if (thisFoodsKcals) {
        const kcals = Math.round(
          (this.catalogue$$()[entry.foodCatalogueId]?.kcals ?? 0) * (entry.foodWeight / 100) * 1,
          // (this.coefficients$$()[entry.foodCatalogueId] || 1), // Without this check you can not add recently added to catalogue food to the diary
        );
        const percent = (kcals / this.diary$$()[dateIso].targetKcals) * 100;
        formattedDiary[dateIso].food[id] = {
          ...entry,
          foodName: this.catalogue$$()[entry.foodCatalogueId]?.name,
          foodKcals: kcals,
          foodPercent: `${Math.floor(percent) < 100 ? percent.toFixed(1) : Math.round(percent).toString()}`,
          foodKcalPercentageOfDaysNorm: percent,
        };
        formattedDiary[dateIso].kcalsEaten += kcals;
        formattedDiary[dateIso].kcalsPercent += percent;
        // }
      }
    }
    return formattedDiary;
  }

  prepCatalogueSortedListSeparate(selected: boolean): CatalogueEntry[] {
    return Object.values(this.catalogue$$())
      .filter((item) =>
        selected ? this.catalogueMyIds$$().includes(item.id) : !this.catalogueMyIds$$().includes(item.id),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getFoodDiaryFullUpdateRange(dateIso?: string, offset?: number): Observable<Diary> {
    // this.extendDates(dateIso, offset);
    const paramsStr = `date=${dateIso ?? getTodayIsoNoTimeNoTZ()}&offset=${offset ?? 7}`;
    return this.http.get<Diary>(`/api/food/diary-full-update?${paramsStr}`).pipe(
      tap((response: Diary) => {
        this.diary$$.set(response);
      }),
    );
  }

  editDiaryEntry(diaryEntry: DiaryEntryEdit): Observable<ServerResponse> {
    return this.http.put<ServerResponse>(`/api/food/diary`, diaryEntry).pipe(
      tap((response: ServerResponse) => {
        if (response.result && response.value) {
          const diaryEntryId: string = response.value;
          this.updateDiaryEntryAfterSucsessfullPut(diaryEntryId, diaryEntry);
        } else {
          // console.error('Ошибка при обновлении записи в дневнике питания');
        }
      }),
    );
  }

  private updateDiaryEntryAfterSucsessfullPut(diaryEntryId: string, diaryEntry: DiaryEntryEdit) {
    this.diary$$.update((diary) => {
      const selectedDay = this.selectedDayIso$$();
      const updatedDiary = { ...diary };
      const updatedDay = { ...updatedDiary[selectedDay] };
      const updatedFood = { ...updatedDay.food };
      const updatedEntry = {
        ...updatedFood[diaryEntryId],
        foodWeight: diaryEntry.foodWeight,
        history: [...updatedFood[diaryEntryId].history, diaryEntry.history[0]],
      };

      updatedFood[diaryEntryId] = updatedEntry;
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

  getDatesOutOfDiary() {
    return Object.keys(this.diary$$());
  }

  getCatalogueEntries(): Observable<Catalogue> {
    // console.log('Getting catalogue');
    return this.http.get<Catalogue>('/api/food/catalogue').pipe(
      tap((response: Catalogue) => {
        this.catalogue$$.set(response);
      }),
    );
  }

  getMyCatalogueEntries(): Observable<CatalogueIds> {
    // console.log('Getting catalogue');
    return this.http.get<CatalogueIds>('/api/food/my-catalogue').pipe(
      tap((response: CatalogueIds) => {
        this.catalogueMyIds$$.set(response);
      }),
    );
  }
}
