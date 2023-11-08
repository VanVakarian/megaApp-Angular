import { AfterViewInit, Component, Input, OnInit, ViewChild, ElementRef, OnDestroy, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Account, Bank, Currency } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ConfirmationDialogService } from 'src/app/services/mat-dialog-modal.service';

@Component({
  selector: 'app-form-account',
  templateUrl: './form-account.component.html',
})
export class FormAccountComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() accountData!: Account;
  @Input() formRole: string = '';
  @Input() bankList: Bank[] = [];
  @Input() currencyList: Currency[] = [];
  @ViewChild('inputTitle') inputTitleElem!: ElementRef;

  token = this.auth.getToken();
  accountForm = new FormGroup({
    id: new FormControl(0),
    title: new FormControl('', [Validators.required]),
    bank_id: new FormControl(0, [Validators.min(1)]),
    currency_id: new FormControl(0, [Validators.min(1)]),
    invest: new FormControl(false),
    kind: new FormControl('', [Validators.required]),
  });
  kinds = [
    { key: 'cash', title: 'Наличные' },
    { key: 'card', title: 'Карточный' },
    { key: 'account', title: 'Текущий' },
    { key: 'deposit', title: 'Вклад' },
  ];

  private accountClickedSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService,
    private utils: UtilsService,
    private confirmModal: ConfirmationDialogService,
    private fb: FormBuilder
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

  emitAccountsChanged$() {
    this.dataSharingService.accountsChanged$.emit();
  }

  openConfirmationModal(actionQuestion: string): void {
    this.confirmModal.openModal(actionQuestion).subscribe((result) => {
      if (result) {
        this.deleteAccount();
      }
    });
  }

  isFormValid(): boolean {
    return this.accountForm.valid;
  }

  clearForm() {
    this.accountForm.reset();
  }

  onSubmit() {
    if (this.formRole === 'new') {
      this.createAccount();
    } else if (this.formRole === 'edit') {
      this.updateAccount();
    }
  }

  createAccount() {
    if (this.token) {
      this.http
        .post('/api/money/account', this.accountForm.value, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Счёт успешно cоздан', 'success');
            this.clearForm();
            this.emitAccountsChanged$();
          },
          error: (error) => {
            console.log('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при создании счёта', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  updateAccount() {
    if (this.token) {
      this.http
        .put(`/api/money/account/${this.accountForm.value.id}`, this.accountForm.value, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Счёт успешно изменён', 'success');
            this.emitAccountsChanged$();
          },
          error: (error) => {
            console.log('Ошибка при обновлении счёта:', error);
            this.notificationsService.addNotification('Ошибка при обновлении счёта', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  deleteAccount() {
    if (this.token) {
      this.http
        .delete(`/api/money/account/${this.accountForm.value.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Счёт успешно удалён', 'success');
            this.emitAccountsChanged$();
          },
          error: (error) => {
            console.log('Ошибка при удалении счёта:', error);
            this.notificationsService.addNotification('Ошибка при удалении счёта', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  ngOnInit(): void {
    if (this.formRole === 'edit') {
      const currency = this.currencyList.find((c) => c.id === this.accountForm.value.currency_id);
      const bank = this.bankList.find((b) => b.id === this.accountForm.value.bank_id);

      if (currency && currency.id !== undefined) {
        this.accountForm.value.currency_id = currency.id;
      } else {
        this.accountForm.value.currency_id = 0;
      }

      if (bank && bank.id !== undefined) {
        this.accountForm.value.bank_id = bank.id;
      } else {
        this.accountForm.value.bank_id = 0;
      }
    }
  }

  ngAfterViewInit(): void {}

  ngOnChanges(): void {
    if (this.accountData) {
      this.accountForm.patchValue(this.accountData);
    }
  }

  ngOnDestroy(): void {
    this.accountClickedSubscription.unsubscribe();
  }
}
