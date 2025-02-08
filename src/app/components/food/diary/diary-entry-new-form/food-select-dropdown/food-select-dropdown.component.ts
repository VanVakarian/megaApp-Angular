import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Signal,
  ViewChild,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FoodService } from '@app/services/food.service';
import { CatalogueEntry } from '@app/shared/interfaces';
import { transliterateEnToRu } from '@app/shared/utils';

@Component({
  selector: 'app-food-select-dropdown',
  templateUrl: './food-select-dropdown.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatIconModule],
  host: {},
})
export class FoodSelectDropdownComponent implements OnInit {
  @Input()
  public parentForm!: FormGroup;

  @Input()
  public foodNameControl!: FormControl;

  @Output()
  public onFoodSelected = new EventEmitter<CatalogueEntry | null>();

  @ViewChild('foodInputElem')
  public foodInputElem!: ElementRef;

  private searchQuery$$: WritableSignal<string> = signal('');

  public filteredCatalogue: Signal<CatalogueEntry[]> = computed(() => {
    const searchTerms = this.searchQuery$$()
      .toLowerCase()
      .split(' ')
      .filter((term) => term.length > 0);

    return this.foodService
      .catalogueSortedListSelected$$()
      .filter((food) => searchTerms.every((term) => food.name.toLowerCase().includes(term)));
  });

  public get searchQuery() {
    return this.searchQuery$$();
  }

  public set searchQuery(value: string) {
    const transliteratedValue = transliterateEnToRu(value);
    this.searchQuery$$.set(transliteratedValue);
  }

  constructor(private foodService: FoodService) {}

  public ngOnInit() {
    this.foodNameControl.valueChanges.subscribe((value) => {
      this.searchQuery$$.set(value || '');
    });
  }

  public shouldShowClearButton(): boolean {
    return this.foodNameControl.value.length > 0;
  }

  public onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const catalogueItem = this.foodService
      .catalogueSortedListSelected$$()
      .find((food) => food.name === event.option.value);

    this.onFoodSelected.emit(catalogueItem || null);
  }

  public focusInput(): void {
    setTimeout(() => {
      this.foodInputElem?.nativeElement?.focus();
    }, 0);
  }
}
