import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Bank } from 'src/app/shared/interfaces';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { ConfirmationDialogService } from 'src/app/services/mat-dialog-modal.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MoneyService } from 'src/app/services/money.service';

@Component({
  selector: 'app-form-bank',
  templateUrl: './form-bank.component.html',
})
export class FormBankComponent implements OnInit, OnChanges, OnDestroy {
  @Input() bankData!: Bank;
  @Input() formRole: string = '';

  @ViewChild('inputTitle') inputTitleElem!: ElementRef;

  public bankForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    title: new FormControl('', Validators.required),
  });

  private bankClickedSubscription: Subscription;

  constructor(
    private dataSharingService: DataSharingService,
    private confirmModal: ConfirmationDialogService,
    private utils: UtilsService,
    public moneyService: MoneyService
  ) {
    this.bankClickedSubscription = this.dataSharingService.bankClicked$.subscribe(async (bankId) => {
      if (this.bankForm.value.id === bankId) {
        await this.setFocusOnInput();
      }
    });
  }

  async setFocusOnInput() {
    await this.utils.sleep(100); // await is the duration of the panel expansion animation, otherwise focus messes with it.
    this.inputTitleElem.nativeElement.focus();
  }

  clearForm(): void {
    this.bankForm.reset();
  }

  onSubmit(): void {
    if (this.formRole === 'new') {
      this.moneyService.createBank(this.bankForm.value as Bank);
      this.clearForm();
    } else if (this.formRole === 'edit') {
      this.moneyService.updateBank(this.bankForm.value as Bank);
    }
  }

  openConfirmationModal(actionQuestion: string): void {
    this.confirmModal.openModal(actionQuestion).subscribe((result) => {
      if (result) {
        this.moneyService.deleteBank(this.bankForm.value.id as number);
      }
    });
  }

  isFormValid(): boolean {
    return this.bankForm.valid;
  }

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (this.bankData) {
      this.bankForm.patchValue(this.bankData);
    }
  }

  ngOnDestroy(): void {
    this.bankClickedSubscription.unsubscribe();
  }
}
