import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FoodService } from '@app/services/food.service';
import { CatalogueEntry } from '@app/shared/interfaces';

interface FoodSelectForm {
  foodName: FormControl<string>;
}

@Component({
  selector: 'app-food-select-dropdown',
  templateUrl: './food-select-dropdown.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  host: {
    // class: 'p-2',
  },
})
export class FoodSelectDropdownComponent implements OnInit {
  @Output()
  public onFoodSelected = new EventEmitter<CatalogueEntry | null>();

  @ViewChild('foodInputElem')
  public foodInputElem!: ElementRef;

  private searchQuery: WritableSignal<string> = signal('');

  public filteredCatalogue: Signal<CatalogueEntry[]> = computed(() => {
    const filterValue = this.searchQuery().toLowerCase();
    return this.foodService
      .catalogueSortedListSelected$$()
      .filter((food) => food.name.toLowerCase().includes(filterValue));
  });

  private catalogueNames$$: Signal<string[]> = computed(() =>
    this.foodService.catalogueSortedListSelected$$().map((food) => food.name),
  );

  private catalogueNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const catalogueItem = this.foodService.catalogueSortedListSelected$$().find((food) => food.name === value);
      return catalogueItem ? null : { notInCatalogue: true };
    };
  }

  public diaryEntryForm = this.fb.group<FoodSelectForm>({
    foodName: this.fb.control('', {
      validators: [Validators.required, this.catalogueNameValidator()],
    }),
  });

  public get foodName() {
    return this.diaryEntryForm.controls.foodName;
  }

  constructor(
    private foodService: FoodService,
    private fb: NonNullableFormBuilder,
  ) {}

  public ngOnInit() {
    this.diaryEntryForm.controls.foodName.valueChanges.subscribe((value) => {
      this.searchQuery.set(value || '');
    });

    // setTimeout(() => {
    //   this.foodInputElem?.nativeElement?.focus();
    // }, 125);
  }

  public shouldShowClearButton(): boolean {
    return this.diaryEntryForm.controls.foodName.value.length > 0;
  }

  public foodNameReset(): void {
    this.diaryEntryForm.controls.foodName.setValue('');
  }

  public onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const catalogueItem = this.foodService
      .catalogueSortedListSelected$$()
      .find((food) => food.name === event.option.value);

    this.onFoodSelected.emit(catalogueItem || null);
  }

  public async onSubmit(): Promise<void> {
    const catalogueItem = this.foodService
      .catalogueSortedListSelected$$()
      .find((food) => food.name === this.diaryEntryForm.controls.foodName.value);

    this.onFoodSelected.emit(catalogueItem || null);
  }

  public focusInput(): void {
    // console.log('focus input', this.foodInputElem.nativeElement);
    this.foodInputElem?.nativeElement?.focus();
  }
}
