import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription, delay, filter, take } from 'rxjs';

import { FoodService } from 'src/app/services/food.service';
import { ConfirmationDialogService } from 'src/app/services/mat-dialog-modal.service';
import { DiaryEntry, ServerResponse } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-edit-diary-entry-form',
  templateUrl: './edit-diary-entry-form.component.html',
})
export class EditDiaryEntryFormComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() diaryEntry!: DiaryEntry;

  // TODO: make focus of change field upon panel open
  @ViewChild('foodWeightChangeElem') foodWeightChangeElem!: ElementRef;

  oldWeightDescriptionString: string = '';
  errorMessageText: string = '';
  errorMessageShow: boolean = false;

  private diaryEntryClickedSubscription: Subscription;

  constructor(public foodService: FoodService, private confirmModal: ConfirmationDialogService) {
    this.diaryEntryClickedSubscription = this.foodService.diaryEntryClicked$
      .pipe(
        filter((diaryEntryId) => this.diaryEntryForm.value.id === diaryEntryId),
        delay(100) // delay is the duration of the panel expansion animation, otherwise focus messes with it.
      )
      .subscribe(() => {
        this.foodWeightChangeElem.nativeElement.focus();
      });
  }

  diaryEntryForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    date: new FormControl(''),
    catalogue_id: new FormControl(0),
    food_weight: new FormControl(null),
    food_weight_initial: new FormControl(0),
    food_weight_new: new FormControl(null),
    food_weight_change: new FormControl(null),
    food_weight_final: new FormControl(0),
  });

  isFormValid(): boolean {
    return (
      this.diaryEntryForm.valid &&
      this.diaryEntryForm.value.food_weight_initial !== this.diaryEntryForm.value.food_weight_new
    );
  }

  onNewWeightInput() {
    this.diaryEntryForm.get('food_weight_change')?.setValue(null);
    const newWeight = this.diaryEntryForm.value.food_weight_new;
    const pattern = /^(?!0+$)\d+$/; // Digits only, but not zero
    if (pattern.test(newWeight)) {
      this.diaryEntryForm.get('food_weight_final')?.setValue(parseInt(newWeight));
      this.oldWeightDescriptionString = `${this.diaryEntryForm.value.food_weight_initial} г.`;
      this.errorMessageShow = false;
    } else {
      this.diaryEntryForm.get('food_weight_final')?.setValue(this.diaryEntryForm.value.food_weight_initial);
      this.errorMessageText = 'Число должно быть целое, положительное.';
      this.errorMessageShow = true;
    }
  }

  onChangeWeightInput() {
    this.diaryEntryForm.get('food_weight_new')?.setValue(null);
    const foorWeightChangeStr = this.diaryEntryForm.value.food_weight_change;
    const foodWeightChangeInt = parseInt(foorWeightChangeStr);
    const pattern = /^[-+]?\d+$/; // digits only with or without a plus or a minus
    if (pattern.test(foorWeightChangeStr) && this.diaryEntryForm.value.food_weight_initial + foodWeightChangeInt > 0) {
      const sign = foodWeightChangeInt < 0 ? '-' : '+';
      this.diaryEntryForm
        .get('food_weight_final')
        ?.setValue(this.diaryEntryForm.value.food_weight_initial + foodWeightChangeInt);
      this.oldWeightDescriptionString = `${this.diaryEntryForm.value.food_weight_initial} г. ${sign} ${Math.abs(
        foodWeightChangeInt
      )} г.`;
      this.errorMessageShow = false;
    } else if (
      pattern.test(foorWeightChangeStr) &&
      this.diaryEntryForm.value.food_weight_initial + foodWeightChangeInt <= 0
    ) {
      this.diaryEntryForm.get('food_weight_final')?.setValue(this.diaryEntryForm.value.food_weight_initial);
      this.errorMessageText = 'Итоговый результат должен быть положительным.';
      this.errorMessageShow = true;
    } else {
      this.diaryEntryForm.get('food_weight_final')?.setValue(this.diaryEntryForm.value.food_weight_initial);
      this.errorMessageText = 'Число должно быть целое. Либо отрицательное, либо положительное.';
      this.errorMessageShow = true;
    }
  }

  onSubmit(): void {
    this.diaryEntryForm.disable();
    this.foodService.postRequestResult$.pipe(take(1)).subscribe((response: ServerResponse) => {
      if (response.result) {
        if (response.value) {
          const diaryEntryId: number = parseInt(response.value);
          this.foodService.diary$$.update((diary) => {
            diary[this.diaryEntryForm.value.date]['food'][diaryEntryId]['food_weight'] =
              this.diaryEntryForm.value.food_weight_final;
            return diary;
          });
        }
        this.diaryEntryForm.enable();
      } else {
        this.diaryEntryForm.enable();
      }
    });

    const preppedFormValues: DiaryEntry = {
      id: this.diaryEntryForm.value.id,
      date: this.diaryEntryForm.value.date,
      catalogue_id: this.diaryEntryForm.value.catalogue_id,
      food_weight: this.diaryEntryForm.value.food_weight_final,
    };
    this.foodService.putDiaryEntry(preppedFormValues);
  }

  openConfirmationModal(actionQuestion: string): void {
    this.confirmModal
      .openModal(actionQuestion)
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          this.onDelete();
        }
      });
  }

  onDelete(): void {
    this.diaryEntryForm.disable();
    this.foodService.postRequestResult$.pipe(take(1)).subscribe((response) => {
      if (response.result) {
        if (response.value) {
          const diaryEntryId: number = parseInt(response.value);
          this.foodService.diary$$.update((diary) => {
            delete diary[this.diaryEntryForm.value.date]['food'][diaryEntryId];
            return diary;
          });
        }
        this.diaryEntryForm.enable();
      } else {
        this.diaryEntryForm.enable();
      }
    });

    this.foodService.deleteDiaryEntry(this.diaryEntryForm.value.id as number);
  }

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (this.diaryEntry) {
      this.diaryEntryForm.patchValue(this.diaryEntry);
      this.diaryEntryForm.get('food_weight_initial')?.setValue(this.diaryEntry.food_weight);
      this.oldWeightDescriptionString = `${this.diaryEntry.food_weight} г.`;
    }
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.diaryEntryClickedSubscription.unsubscribe();
  }
}
