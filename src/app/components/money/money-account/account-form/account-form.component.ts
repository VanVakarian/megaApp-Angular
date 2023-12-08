import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Account, Bank, Currency } from 'src/app/shared/interfaces';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ConfirmationDialogService } from 'src/app/services/mat-dialog-modal.service';
import { MoneyService } from 'src/app/services/money.service';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
})
export class AccountFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() accountData!: Account;
  @Input() formRole: string = '';

  @ViewChild('inputTitle') inputTitleElem!: ElementRef;

  public accountForm = new FormGroup({
    id: new FormControl(0),
    title: new FormControl('', [Validators.required]),
    bank_id: new FormControl(0, [Validators.min(1)]),
    currency_id: new FormControl(0, [Validators.min(1)]),
    invest: new FormControl(false),
    kind: new FormControl('', [Validators.required]),
  });
  public kinds = [
    { key: 'cash', title: 'Наличные' },
    { key: 'card', title: 'Карточный' },
    { key: 'account', title: 'Текущий' },
    { key: 'deposit', title: 'Вклад' },
  ];

  private accountClickedSubscription: Subscription;

  constructor(
    private dataSharingService: DataSharingService,
    private utils: UtilsService,
    private confirmModal: ConfirmationDialogService,
    public moneyService: MoneyService
  ) {
    this.accountClickedSubscription = this.dataSharingService.accountClicked$.subscribe(async (accountId) => {
      if (this.accountForm.value.id === accountId) {
        await this.setFocusOnInput();
      }
    });
  }

  async setFocusOnInput() {
    await this.utils.sleep(100); // await is the duration of the panel expansion animation, otherwise focus messes with it.
    this.inputTitleElem.nativeElement.focus();
  }

  clearForm() {
    this.accountForm.reset();
  }

  onSubmit() {
    if (this.formRole === 'new') {
      this.moneyService.createAccount(this.accountForm.value as Account);
      this.clearForm();
    } else if (this.formRole === 'edit') {
      this.moneyService.updateAccount(this.accountForm.value as Account);
    }
  }

  openConfirmationModal(actionQuestion: string): void {
    this.confirmModal.openModal(actionQuestion).subscribe((result) => {
      if (result) {
        this.moneyService.deleteAccount(this.accountForm.value.id as number);
      }
    });
  }

  isFormValid(): boolean {
    return this.accountForm.valid;
  }

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (this.accountData) {
      this.accountForm.patchValue(this.accountData);
    }
  }

  ngOnDestroy(): void {
    this.accountClickedSubscription.unsubscribe();
  }
}
