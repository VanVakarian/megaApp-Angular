import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Currency } from 'src/app/shared/interfaces';
import { DataSharingService } from 'src/app/components/refactor/service/data-sharing.service';
import { ConfirmationDialogService } from 'src/app/components/refactor/service/mat-dialog-modal.service';
import { UtilsService } from 'src/app/components/refactor/service/utils.service';
import { MoneyService } from 'src/app/components/refactor/service/money.service';

@Component({
  selector: 'app-currency-form',
  templateUrl: './currency-form.component.html',
})
export class CurrencyFormComponent implements OnInit, OnDestroy {
  @Input() currencyData!: Currency;
  @Input() formRole: string = '';

  @ViewChild('inputTitle') inputTitleElem!: ElementRef;

  public currencyForm = new FormGroup({
    id: new FormControl(0),
    title: new FormControl('', [Validators.required]),
    ticker: new FormControl('', [Validators.required]),
    symbol: new FormControl('', [Validators.required]),
    symbol_pos: new FormControl('prefix'),
    whitespace: new FormControl(false),
  });

  private currencyClickedSubscription: Subscription;

  constructor(
    private dataSharingService: DataSharingService,
    private confirmModal: ConfirmationDialogService,
    private utils: UtilsService,
    public moneyService: MoneyService
  ) {
    this.currencyClickedSubscription = this.dataSharingService.currencyClicked$.subscribe(async (currencyId) => {
      if (this.currencyForm.value.id === currencyId) {
        await this.setFocusOnInput();
      }
    });
  }

  async setFocusOnInput() {
    await this.utils.sleep(100); // sleep is the duration of the panel expansion animation, otherwise focus messes with it.
    this.inputTitleElem.nativeElement.focus();
  }

  clearForm(): void {
    this.currencyForm.reset();
    // this.currencyForm.markAsPristine(); // TODO: Remove red warnings from 'new' form after submitting and clearing a form, this doesn't work.
    // this.currencyForm.markAsUntouched();
  }

  onSubmit() {
    if (this.formRole === 'new') {
      this.moneyService.createCurrency(this.currencyForm.value as Currency);
      this.clearForm();
    } else if (this.formRole === 'edit') {
      this.moneyService.updateCurrency(this.currencyForm.value as Currency);
    }
  }

  openConfirmationModal(actionQuestion: string): void {
    this.confirmModal.openModal(actionQuestion).subscribe((result) => {
      if (result) {
        this.moneyService.deleteCurrency(this.currencyForm.value.id as number);
      }
    });
  }

  isFormValid(): boolean {
    return this.currencyForm.valid;
  }

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (this.currencyData) {
      this.currencyForm.patchValue(this.currencyData);
    }
  }

  ngOnDestroy(): void {
    this.currencyClickedSubscription.unsubscribe();
  }
}
