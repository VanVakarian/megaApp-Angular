import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ConfirmationDialogService } from 'src/app/services/mat-dialog-modal.service';
import { MoneyService } from 'src/app/services/money.service';
import { Account, Transaction } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-transaction-expense-income-form',
  templateUrl: './transaction-expense-income-form.component.html',
})
export class TransactionExpenseIncomeForm implements OnInit, OnDestroy {
  @Input() transactionData!: Transaction;
  @Input() formRole: string = '';

  chosenAccount!: Account;
  chosenCurrencyId: number = 0;
  chosenAccountsCurrencySymbol = '';
  chosenAccountsCurrencyPosition = '';

  public transactionForm = new FormGroup({
    id: new FormControl(0),
    account_id: new FormControl(0, [Validators.min(1)]),
    amount: new FormControl(0, [Validators.min(1)]),
    notes: new FormControl(''),
    // kind: new FormControl('', [Validators.required]),
  });

  constructor(private confirmModal: ConfirmationDialogService, public moneyService: MoneyService) {}

  updateChosenCurrencyId(isUserInput: boolean, account: Account) {
    if (isUserInput) {
      const currencyId = account.currency_id;
      this.chosenAccountsCurrencySymbol = this.moneyService.currencies$$()?.[currencyId].symbol;
      this.chosenAccountsCurrencyPosition = this.moneyService.currencies$$()?.[currencyId].symbol_pos;
    }
  }

  onSubmit() {
    if (this.formRole === 'new') {
      // this.moneyService.createAccount(this.transactionForm.value as Account);
      this.clearForm();
    } else if (this.formRole === 'edit') {
      // this.moneyService.updateAccount(this.transactionForm.value as Account);
    }
  }

  clearForm() {
    this.transactionForm.reset();
  }

  openConfirmationModal(actionQuestion: string): void {
    this.confirmModal.openModal(actionQuestion).subscribe((result) => {
      if (result) {
        // this.moneyService.deleteAccount(this.transactionForm.value.id as number);
      }
    });
  }

  isFormValid(): boolean {
    return this.transactionForm.valid;
  }

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (this.transactionData) {
      this.transactionForm.patchValue(this.transactionData);
      const accountId = this.transactionData.account_id;
      const currencyId = this.moneyService.accounts$$()?.[accountId].currency_id;
      this.chosenAccountsCurrencySymbol = this.moneyService.currencies$$()?.[currencyId].symbol;
      this.chosenAccountsCurrencyPosition = this.moneyService.currencies$$()?.[currencyId].symbol_pos;
    }
  }

  ngOnDestroy(): void {}
}
