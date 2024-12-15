import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Signal,
  SimpleChanges,
  ViewChild,
  computed,
  effect,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { Subject, Subscription, firstValueFrom } from 'rxjs';

import { FoodService } from 'src/app/services/food.service';
import { CatalogueEntry, DiaryEntry } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-diary-entry-new-form',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
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
  @Input()
  public expanded = false;

  @Output()
  public onServerSuccessfullResponse = new EventEmitter<void>();

  @ViewChild('foodInputElem')
  public foodInputElem!: ElementRef;

  @ViewChild('weightInputElem')
  public weightInputElem!: ElementRef;

  private subscription = new Subscription();

  public filteredCatalogue$: Subject<CatalogueEntry[]> = new Subject<CatalogueEntry[]>();

  private catalogueNames$$: Signal<string[]> = computed(() =>
    this.foodService.catalogueSortedListSelected$$().map((food) => food.name),
  );

  private catalogueNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return this.catalogueNames$$().includes(value) ? null : { notInCatalogue: true };
    };
  };

  public diaryEntryForm: FormGroup = new FormGroup({
    foodCatalogueId: new FormControl(0),
    foodName: new FormControl('', [
      Validators.required,
      this.catalogueNameValidator(),
    ]),
    foodWeight: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^\d+$/), // Digits only
    ]),
  });

  constructor(public foodService: FoodService) {
    effect(() => { console.log('CATALOGUE NAMES have been updated:', this.catalogueNames$$()); }); // prettier-ignore
  }

  public ngOnInit(): void {
    this.subscribe();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['expanded'] && changes['expanded'].currentValue) {
      setTimeout(() => {
        this.foodInputElem?.nativeElement?.focus();
      }, 125);
    }
  }

  public ngAfterViewInit(): void { }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public isFormValid(): boolean {
    return this.diaryEntryForm.valid;
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
    const response = await firstValueFrom(this.foodService.createDiaryEntry(preppedDiaryEntry));
    if (response?.result) {
      if (response.diaryId) {
        this.onServerSuccessfullResponse.emit();
      }
      this.diaryEntryForm.enable();
    } else {
      this.diaryEntryForm.enable();
    }
  }

  private subscribe(): void {
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

  public foodNameReset(): void {
    this.diaryEntryForm.get('foodName')!.setValue('');
  }

  public shouldShowClearButton(): boolean {
    return this.diaryEntryForm.get('foodName')!.value && this.diaryEntryForm.get('foodName')!.value.length > 0;
  }

  public get foodName() {
    return this.diaryEntryForm.get('foodName');
  }

  public get foodWeight() {
    return this.diaryEntryForm.get('foodWeight');
  }
}
