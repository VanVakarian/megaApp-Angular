import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { FoodService } from 'src/app/services/food.service';
import { CatalogueEntry, DiaryEntry } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-edit-diary-entry-form',
  templateUrl: './edit-diary-entry-form.component.html',
})
export class EditDiaryEntryFormComponent implements OnInit, OnChanges {
  @Input() formRole: string = '';
  @Input() selectedDateISO: string = '';
  @Input() diaryEntry?: DiaryEntry;

  @Output() closeEvent = new EventEmitter();

  filteredCatalogue!: Observable<CatalogueEntry[]>;

  food_name = new FormControl('');

  diaryEntryForm: FormGroup = new FormGroup({
    catalogue_id: new FormControl(0),
    date_iso: new FormControl(''),
    food_weight: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)]), // digits only
  });

  constructor(public foodService: FoodService) {}

  isFormValid(): boolean {
    return this.diaryEntryForm.valid;
  }

  onFoodSelected(event: MatAutocompleteSelectedEvent) {
    const selectedFood = this.foodService
      .catalogueSortedListSelected$$()
      .find((food) => food.name === event.option.value);
    if (selectedFood) {
      // this.diaryEntryForm.get('catalogue_id')!.setValue(selectedFood.id);
    }
  }

  onSubmit(): void {}

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
      this.diaryEntryForm.get('date_iso')!.setValue(this.selectedDateISO);
    }
  }
}
