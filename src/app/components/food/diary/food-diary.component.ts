import { NgStyle } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatAccordion, MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { combineLatest } from 'rxjs';

import { DiaryEntryEditFormComponent } from 'src/app/components/food/diary/diary-entry-edit-form/diary-entry-edit-form.component';
import { DiaryEntryNewFormComponent } from 'src/app/components/food/diary/diary-entry-new-form/diary-entry-new-form.component';
import { DiaryNavButtonsComponent } from 'src/app/components/food/diary/diary-nav/diary-nav-buttons.component';
import { FoodService } from 'src/app/services/food.service';
import { BodyWeightComponent } from './body-weight/body-weight.component';

@Component({
  selector: 'app-food-diary',
  standalone: true,
  imports: [
    NgStyle,
    MatExpansionModule,
    MatCardModule,
    MatIconModule,
    DiaryNavButtonsComponent,
    DiaryEntryEditFormComponent,
    DiaryEntryNewFormComponent,
    BodyWeightComponent,
  ],
  templateUrl: './food-diary.component.html',
  styleUrl: './food-diary.component.scss',
  // animations: [
  //   trigger('rotateIcon', [
  //     state('closed', style({ transform: 'rotate(0deg)' })),
  //     state('open', style({ transform: 'rotate(45deg)' })),
  //     transition('closed <=> open', animate('300ms ease-out')),
  //   ]),
  // ],
})
export class FoodDiaryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatAccordion)
  public foodAccordion!: MatAccordion;

  @ViewChild('foodCont')
  public contDiv!: ElementRef;

  @ViewChildren('foodName')
  public nameDivs!: QueryList<ElementRef>;

  @ViewChildren('foodWeight')
  public weightsDivs!: QueryList<ElementRef>;

  @ViewChildren('foodKcals')
  public kcalsDivs!: QueryList<ElementRef>;

  @ViewChildren('foodPercent')
  public percentsDivs!: QueryList<ElementRef>;

  // @ViewChild('#diaryEntry') diaryEntryDivs!: ElementRef;

  // direction: string = 'left';
  // daysList: string[] = [];
  // calendarSelectedDay: FormControl = new FormControl(new Date());

  // today: Date = new Date();
  // todayDate: number = this.today.setHours(0, 0, 0, 0);
  // selectedDateMs: number = this.todayDate;
  // selectedDateISO: string = dateToIsoNoTimeNoTZ(this.today.getTime());

  // showFloatingWindow: boolean = false;

  constructor(
    public foodService: FoodService,
    // private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  public ngOnInit(): void {
    // setTimeout(() => {
    //   this.foodService.getFoodDiary('2024-06-20', 2).subscribe();
    // }, 3333);
    //   this.daysList = generateDatesList(this.selectedDateISO);
  }

  public ngAfterViewInit(): void {
    // setting columns width
    combineLatest([this.weightsDivs.changes, this.kcalsDivs.changes, this.percentsDivs.changes]).subscribe(() =>
      this.adjustWidths(),
    );
    setTimeout(() => this.adjustWidths(), 100);
  }

  public ngOnDestroy(): void { }

  public get todaysKcalsPercent() {
    return this.foodService.diaryFormatted$$()?.[this.selectedDateIso]?.['kcalsPercent'] ?? 0;
  }

  public get todaysFood() {
    const selectedDay = this.foodService.selectedDayIso$$();
    // console.log('selectedDay:', selectedDay);
    const todaysFood = this.foodService.diaryFormatted$$()?.[selectedDay]?.food;

    if (todaysFood) {
      const foodArray = Object.values(todaysFood);
      // foodArray.sort((a: FormattedDiaryEntry, b: FormattedDiaryEntry) => a.dateISO - b.dateISO);
      // console.log('Sorted todaysFood:', foodArray);
      return foodArray;
    }

    return [];
  }

  private get selectedDateIso() {
    return this.foodService.selectedDayIso$$();
  }
  public get todaysKcalsEaten() {
    return this.foodService.diaryFormatted$$()?.[this.selectedDateIso]?.['kcalsEaten'];
  }
  public get todaysTargetKcals() {
    return this.foodService.diary$$()?.[this.selectedDateIso]?.['targetKcals'];
  }
  public get formatSelectedDaysEatenPercent(): number {
    return Math.round(this.foodService.diaryFormatted$$()?.[this.selectedDateIso]?.['kcalsPercent'] * 10) / 10;
  }

  // VIEW FNs
  public setBackgroundStyle(percent: number) {
    const percentCapped = percent <= 100 ? percent : 100;
    return {
      background: `linear-gradient(to right, var(--gradient-color) ${ percentCapped }%, var(--gradient-bg) ${ percentCapped }%)`,
    };
  }
  // DIARY
  public diaryEntryExpanded(diaryEntry: MatExpansionPanel, diaryEntryId: number) {
    this.foodService.diaryEntryClickedFocus$.next(diaryEntryId);
    this.foodService.diaryEntryClickedScroll$.next(diaryEntry._body);
  }

  // regenerateDaysList(): void {
  //   const dayIdx = this.daysList.indexOf(this.selectedDateISO);

  //   if (
  //     dayIdx < Math.floor((FETCH_DAYS_RANGE_OFFSET * 2) / 4) ||
  //     dayIdx > Math.ceil(((FETCH_DAYS_RANGE_OFFSET * 2) / 4) * 3)
  //   ) {
  //     this.daysList = generateDatesList(this.selectedDateISO);
  //     this.foodService.getFullUpdate(this.selectedDateISO);
  //   }
  // }

  // COLUMN WIDH SETTING FNS
  private adjustWidths(): void {
    this.ngZone.run(() => {
      this.setWidth(this.weightsDivs);
      this.setWidth(this.kcalsDivs);
      this.setWidth(this.percentsDivs);

      const weightsWidth = this.getMaxWidth(this.weightsDivs);
      const kcalsWidth = this.getMaxWidth(this.kcalsDivs);
      const percentsWidth = this.getMaxWidth(this.percentsDivs);

      this.setWidth(this.weightsDivs, weightsWidth + 3);
      this.setWidth(this.kcalsDivs, kcalsWidth + 10);
      this.setWidth(this.percentsDivs, percentsWidth + 12);

      if (this.contDiv && this.contDiv.nativeElement) {
        const remainingWidth = this.contDiv.nativeElement.offsetWidth - weightsWidth - kcalsWidth - percentsWidth;
        this.setWidth(this.nameDivs, remainingWidth);
      }
    });
  }

  private getMaxWidth(elems: QueryList<ElementRef>): number {
    const widths = elems.map((elem) => elem.nativeElement.offsetWidth);
    return Math.max(...widths);
  }

  private setWidth(elems: QueryList<ElementRef>, width?: number): void {
    elems.forEach((elem) => {
      elem.nativeElement.style.width = width === undefined ? 'auto' : `${ width }px`;
    });
  }

  protected accordionCollapse() {
    this.foodAccordion.closeAll();
  }

}
