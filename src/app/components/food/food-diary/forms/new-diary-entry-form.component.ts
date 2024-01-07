import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Signal,
  ViewChild,
  computed,
  effect,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, map, startWith, take } from 'rxjs';

import { FoodService } from 'src/app/services/food.service';
import { CatalogueEntry, DiaryEntry } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-new-diary-entry-form',
  templateUrl: './new-diary-entry-form.component.html',
})
export class NewDiaryEntryFormComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() selectedDateISO: string = '';
  @Input() diaryEntry?: DiaryEntry;

  @Output() closeEvent = new EventEmitter();

  @ViewChild('foodInputElem') foodInputElem!: ElementRef;
  @ViewChild('weightInputElem') weightInputElem!: ElementRef;

  filteredCatalogue!: Observable<CatalogueEntry[]>;

  catalogueNames$$: Signal<string[]> = computed(() =>
    this.foodService.catalogueSortedListSelected$$().map((food) => food.name)
  );

  food_name = new FormControl('', [Validators.required, this.customCatalogueNameValidator(this.catalogueNames$$())]);

  // A custom validator that checks whether the value exists in the given names array.
  private customCatalogueNameValidator(names: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden = !names.includes(control.value);
      return forbidden ? { forbiddenName: { value: control.value } } : null;
    };
  }

  diaryEntryForm: FormGroup = new FormGroup({
    date: new FormControl(''),
    food_catalogue_id: new FormControl(0),
    food_weight: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)]), // Digits only
  });

  constructor(public foodService: FoodService) {
    // effect(() => { console.log('CATALOGUE NAMES has been updated:', this.catalogueNames$$()) }); // prettier-ignore
  }

  isFormValid(): boolean {
    return this.diaryEntryForm.valid && this.food_name.valid;
  }

  onFoodSelected(event: MatAutocompleteSelectedEvent) {
    const selectedFood = this.foodService
      .catalogueSortedListSelected$$()
      .find((food) => food.name === event.option.value);

    if (selectedFood) {
      this.diaryEntryForm.get('food_catalogue_id')!.setValue(selectedFood.id);
    }

    setTimeout(() => {
      this.weightInputElem.nativeElement.focus();
    }, 100); // Without this 'delay' focus doesn't work
  }

  onSubmit(): void {
    this.diaryEntryForm.disable();
    const preppedDiaryEntry: DiaryEntry = {
      ...this.diaryEntryForm.value,
      id: null,
      food_weight: parseInt(this.diaryEntryForm.value.food_weight),
      history: [{ action: 'init', value: parseInt(this.diaryEntryForm.value.food_weight) }],
    };

    this.foodService.postRequestResult$.pipe(take(1)).subscribe((response) => {
      if (response.result) {
        if (response.value) {
          const diaryEntryId = parseInt(response.value);
          this.foodService.diary$$.update((diary) => {
            diary[this.selectedDateISO]['food'][diaryEntryId] = { ...preppedDiaryEntry, id: diaryEntryId };
            return diary;
          });
          this.closeEvent.emit();
        }
        this.diaryEntryForm.enable();
      } else {
        this.diaryEntryForm.enable();
      }
    });

    this.foodService.postDiaryEntry(preppedDiaryEntry);
  }

  ngOnInit(): void {
    this.filteredCatalogue = this.food_name.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string): CatalogueEntry[] {
    const filterValue = value.toLowerCase();
    return this.foodService
      .catalogueSortedListSelected$$()
      .filter((food) => food.name.toLowerCase().includes(filterValue));
  }

  ngOnChanges(): void {
    if (this.selectedDateISO) {
      this.diaryEntryForm.get('date')!.setValue(this.selectedDateISO);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.foodInputElem.nativeElement.focus();
    }, 175); // The purpose of this delay is to provide time for the animation to finish, allowing the dropdown list to appear correctly
  }
}
