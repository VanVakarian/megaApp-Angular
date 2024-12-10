import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  Signal,
  ViewChild,
  computed,
} from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Observable, Subject, Subscription, firstValueFrom, map, startWith, take } from 'rxjs';

import { FoodService } from 'src/app/services/food.service';
import { CatalogueEntry, DiaryEntry, DiaryEntryEdit } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-diary-entry-new-form',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './diary-entry-new-form.component.html',
})
export class DiaryEntryNewFormComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  //   @Input() selectedDateISO: string = '';
  //   @Input() diaryEntry?: DiaryEntry;
  //   @Output() closeEvent = new EventEmitter();
  @ViewChild('foodInputElem') public foodInputElem!: ElementRef;
  @ViewChild('weightInputElem') public weightInputElem!: ElementRef;

  // filteredCatalogue!: Observable<CatalogueEntry[]>;

  private subscription = new Subscription();

  public filteredCatalogue$: Subject<CatalogueEntry[]> = new Subject<CatalogueEntry[]>();

  private catalogueNames$$: Signal<string[]> = computed(() =>
    this.foodService.catalogueSortedListSelected$$().map((food) => food.name),
  );

  // A custom validator that checks whether the value exists in the given names array.
  private customCatalogueNameValidator(names: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden = !names.includes(control.value);
      return forbidden ? { forbiddenName: { value: control.value } } : null;
    };
  }

  public diaryEntryForm: FormGroup = new FormGroup({
    foodCatalogueId: new FormControl(0),
    foodName: new FormControl('', [Validators.required]),
    foodWeight: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)]), // Digits only
  });

  constructor(public foodService: FoodService) {
    // effect(() => { console.log('CATALOGUE NAMES has been updated:', this.catalogueNames$$()) }); // prettier-ignore
  }

  public ngOnInit(): void {
    this.subscribe();
  }

  public ngOnChanges(): void { }

  public ngAfterViewInit(): void {
    // TODO: make it work
    // setTimeout(() => {
    //   this.foodInputElem.nativeElement.focus();
    // }, 175); // The purpose of this delay is to provide time for the animation to finish, allowing the dropdown list to appear correctly
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public isFormValid(): boolean {
    return this.diaryEntryForm.valid && this.isCatalogueNameExistValidator();
  }

  private isCatalogueNameExistValidator(): boolean {
    // TODO: implement
    return true;
  }

  public onFoodSelected(event: MatAutocompleteSelectedEvent) {
    const selectedFood = this.foodService
      .catalogueSortedListSelected$$()
      .find((food) => food.name === event.option.value);
    if (selectedFood) {
      this.diaryEntryForm.get('foodCatalogueId')!.setValue(selectedFood.id);
    }
    setTimeout(() => {
      this.weightInputElem.nativeElement.focus();
    }, 100); // Without this 'delay' focus doesn't work
  }

  public async onSubmit(): Promise<void> {
    this.diaryEntryForm.disable();
    const foodWeight = parseInt(this.diaryEntryForm.value.foodWeight);
    const preppedDiaryEntry: DiaryEntry = {
      id: 0,
      dateISO: this.foodService.selectedDayIso$$(),
      foodCatalogueId: this.diaryEntryForm.get('foodCatalogueId')!.value,
      foodWeight: foodWeight,
      history: [{ action: 'init', value: foodWeight }],
    };
    const isSuccess = await firstValueFrom(this.foodService.createDiaryEntry(preppedDiaryEntry));
    console.log('isSuccess', isSuccess);
    //     this.foodService.postRequestResult$.pipe(take(1)).subscribe((response) => {
    //       if (response.result) {
    //         if (response.value) {
    //           const diaryEntryId = parseInt(response.value);
    //           this.foodService.diary$$.update((diary) => {
    //             diary[this.selectedDateISO]['food'][diaryEntryId] = { ...preppedDiaryEntry, id: diaryEntryId };
    //             return diary;
    //           });
    //           this.closeEvent.emit();
    //         }
    //         this.diaryEntryForm.enable();
    //       } else {
    //         this.diaryEntryForm.enable();
    //       }
    //     });
    //     this.foodService.postDiaryEntry(preppedDiaryEntry);
  }

  private subscribe(): void {
    // this.filteredCatalogue = this.diaryEntryForm.get('foodName')!.valueChanges.pipe(
    //   startWith(''),
    //   map((value) => this._filter(value || '')),
    // );
    this.subscription.add(
      this.diaryEntryForm.get('foodName')!.valueChanges.subscribe((value) => {
        this.filteredCatalogue$.next(this._filter(value || ''));
      }),
    );
  }

  private _filter(value: string): CatalogueEntry[] {
    const filterValue = value.toLowerCase();
    return this.foodService
      .catalogueSortedListSelected$$()
      .filter((food) => food.name.toLowerCase().includes(filterValue));
  }

  public onFoodSelect(): void {
    this.diaryEntryForm.get('foodName')!.setValue('');
  }
}
