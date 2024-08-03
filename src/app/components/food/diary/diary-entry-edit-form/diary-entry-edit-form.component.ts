import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Subscription, delay, filter, take } from 'rxjs';

// import { ConfirmationDialogService } from 'src/app/components/refactor/service/mat-dialog-modal.service';
import { FoodService } from 'src/app/services/food.service';
import { KeyboardService } from 'src/app/services/keyboard.service';
import { DiaryEntry, HistoryEntry, DiaryEntryEdit, ServerResponse } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-diary-entry-edit-form',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './diary-entry-edit-form.component.html',
})
export class DiaryEntryEditFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() diaryEntry!: DiaryEntry;
  @Output() onServerSuccessfullEditResponse = new EventEmitter<void>();

  @ViewChild('foodWeightChangeElem') foodWeightChangeElem!: ElementRef;

  oldWeightDescriptionString: string = '';
  errorMessageText: string = '';
  errorMessageShow: boolean = false;

  showHistory: boolean = false;
  private historyAction: 'set' | 'add' | 'subtract' = 'set';

  private newWeightPattern = /^(?!0+$)\d+$/; // Digits only, but not zero
  private editWeightPattern = /^[-+]?\d+$/; // Digits only with or without a plus or a minus
  private diaryEntryClickedSubscription: Subscription;

  constructor(
    public foodService: FoodService,
    // private confirmModal: ConfirmationDialogService,
    private keyboardService: KeyboardService,
  ) {
    this.diaryEntryClickedSubscription = this.foodService.diaryEntryClickedFocus$
      .pipe(
        filter((diaryEntryId) => this.diaryEntryForm.value.id === diaryEntryId),
        delay(100), // delay is the duration of the panel expansion animation, otherwise focus messes with it.
      )
      .subscribe(() => {
        this.foodWeightChangeElem.nativeElement.focus();
      });
  }
  diaryEntryForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    date: new FormControl(''),
    foodCatalogueId: new FormControl(0),
    foodWeight: new FormControl(null),
    foodWeightInitial: new FormControl(0),
    foodWeightNew: new FormControl(null, [Validators.pattern(this.newWeightPattern)]),
    foodWeightChange: new FormControl(null, [Validators.pattern(this.editWeightPattern)]),
    foodWeightFinal: new FormControl(0),
  });

  isFormValid(): boolean {
    return (
      this.diaryEntryForm.valid &&
      this.diaryEntryForm.value.foodWeightInitial !== this.diaryEntryForm.value.foodWeightNew &&
      (this.diaryEntryForm.value.foodWeightNew || this.diaryEntryForm.value.foodWeightChange)
    );
  }

  get toDoIHaveNoIdeaHowToNameThis01() {
    return this.foodService.catalogue$$()?.[this.diaryEntryForm.get('foodCatalogueId')?.value]?.name;
  }

  onNewWeightInput() {
    this.diaryEntryForm.get('foodWeightChange')?.setValue(null);
    const newWeight = this.diaryEntryForm.value.foodWeightNew;
    if (this.newWeightPattern.test(newWeight)) {
      this.diaryEntryForm.get('foodWeightFinal')?.setValue(parseInt(newWeight));
      this.oldWeightDescriptionString = `${this.diaryEntryForm.value.foodWeightInitial} г.`;
      this.errorMessageShow = false;
    } else {
      this.diaryEntryForm.get('foodWeightFinal')?.setValue(this.diaryEntryForm.value.foodWeightInitial);
      this.errorMessageText = 'Число должно быть целое, положительное.';
      this.errorMessageShow = true;
    }
  }

  onChangeWeightInput() {
    this.diaryEntryForm.get('foodWeightNew')?.setValue(null);
    const foorWeightChangeStr = this.diaryEntryForm.value.foodWeightChange;
    const foodWeightChangeInt = parseInt(foorWeightChangeStr);
    if (
      this.editWeightPattern.test(foorWeightChangeStr) &&
      this.diaryEntryForm.value.foodWeightInitial + foodWeightChangeInt > 0
    ) {
      const sign = foodWeightChangeInt < 0 ? '-' : '+';
      this.diaryEntryForm
        .get('foodWeightFinal')
        ?.setValue(this.diaryEntryForm.value.foodWeightInitial + foodWeightChangeInt);
      this.oldWeightDescriptionString = `${this.diaryEntryForm.value.foodWeightInitial} г. ${sign} ${Math.abs(
        foodWeightChangeInt,
      )} г.`;
      this.errorMessageShow = false;
    } else if (
      this.editWeightPattern.test(foorWeightChangeStr) &&
      this.diaryEntryForm.value.foodWeightInitial + foodWeightChangeInt <= 0
    ) {
      this.diaryEntryForm.get('foodWeightFinal')?.setValue(this.diaryEntryForm.value.foodWeightInitial);
      this.errorMessageText = 'Итоговый результат должен быть положительным.';
      this.errorMessageShow = true;
    } else {
      this.diaryEntryForm.get('foodWeightFinal')?.setValue(this.diaryEntryForm.value.foodWeightInitial);
      this.errorMessageText = 'Число должно быть целое. Либо отрицательное, либо положительное.';
      this.errorMessageShow = true;
    }
  }

  onSubmit(): void {
    const weightChange = this.diaryEntryForm.value.foodWeightChange;
    // console.log('tempdel01, weightChange:', weightChange);
    this.historyAction = weightChange ? (String(weightChange).includes('-') ? 'subtract' : 'add') : 'set';
    const value = weightChange || this.diaryEntryForm.value.foodWeightFinal;
    const history = { action: this.historyAction, value: Math.abs(parseInt(value)) };
    this.diaryEntryForm.disable();
    const preppedFormValues: DiaryEntryEdit = {
      id: this.diaryEntryForm.value.id,
      foodWeight: this.diaryEntryForm.value.foodWeightFinal,
      history: [history],
    };
    // console.log('tempdel02, preppedFormValues:', preppedFormValues);
    this.foodService.editDiaryEntry(preppedFormValues).subscribe({
      next: () => {
        this.diaryEntryForm.enable();
        this.diaryEntryForm.reset();
        this.onServerSuccessfullEditResponse.emit();
      },
      error: () => this.diaryEntryForm.enable(),
    });
  }

  openConfirmationModal(actionQuestion: string): void {
    // this.confirmModal
    //   .openModal(actionQuestion)
    //   .pipe(take(1))
    //   .subscribe((result) => {
    //     if (result) {
    //       this.onDelete();
    //     }
    //   });
  }

  //   onDelete(): void {
  //     this.diaryEntryForm.disable();
  //     this.foodService.postRequestResult$.pipe(take(1)).subscribe((response) => {
  //       if (response.result) {
  //         if (response.value) {
  //           const diaryEntryId: number = parseInt(response.value);
  //           this.foodService.diary$$.update((diary) => {
  //             delete diary[this.diaryEntryForm.value.date]['food'][diaryEntryId];
  //             return diary;
  //           });
  //         }
  //         this.diaryEntryForm.enable();
  //       } else {
  //         this.diaryEntryForm.enable();
  //       }
  //     });

  //     this.foodService.deleteDiaryEntry(this.diaryEntryForm.value.id as number);
  //   }

  // HISTORY
  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  formHistoryEntry(historyEntry: HistoryEntry) {
    switch (historyEntry.action) {
      case 'init':
        return `Запись создана с весом ${historyEntry.value} г.`;
      case 'set':
        return `Задан новый вес: ${historyEntry.value} г.`;
      case 'add':
        return `Добавлено ${historyEntry.value} г.`;
      case 'subtract':
        return `Убрано ${historyEntry.value} г.`;
    }
  }

  chooseIconForHistoryEntry(historyEntry: HistoryEntry) {
    switch (historyEntry.action) {
      case 'init':
        return 'grade';
      case 'set':
        return 'create';
      case 'add':
        return 'add';
      case 'subtract':
        return 'remove';
    }
  }

  onFocus() {
    this.keyboardService.setInputFocus(true); // turning off keyboard operation
  }

  onBlur() {
    this.keyboardService.setInputFocus(false); // turning keyboard operation back on
  }

  // LIFECYCLE HOOKS
  ngOnInit(): void {}

  ngOnChanges(): void {
    if (this.diaryEntry) {
      this.diaryEntryForm.patchValue(this.diaryEntry);
      this.diaryEntryForm.get('foodWeightInitial')?.setValue(this.diaryEntry.foodWeight);
      this.oldWeightDescriptionString = `${this.diaryEntry.foodWeight} г.`;
    }
  }

  ngOnDestroy(): void {
    this.diaryEntryClickedSubscription.unsubscribe();
  }
}
