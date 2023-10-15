import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AccountsFormData, BankFormData, CurrencyFormData } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-form-account',
  templateUrl: './form-account.component.html',
})
export class FormAccountComponent implements OnInit, AfterViewInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}
  token = this.auth.getToken();

  emitAccountsChanged() {
    // console.log('emitAccountsChanged');
    this.dataSharingService.accountsChanged.emit();
  }

  @Input() accountFormData: AccountsFormData = {
    title: '',
    currency_id: 0,
    bank_id: 0,
    invest: false,
    kind: '',
  };
  @Input() currencyList: CurrencyFormData[] = [];
  @Input() bankList: BankFormData[] = [];
  kinds = [
    { key: 'cash', title: 'Наличные' },
    { key: 'card', title: 'Карточный' },
    { key: 'account', title: 'Текущий' },
    { key: 'deposit', title: 'Вклад' },
  ];
  @Input() formRole: string = '';
  @Output() confirmationModalOpen = new EventEmitter<boolean>();

  isConfirmationModalOpen: boolean = false;
  actionQuestion: string = '';

  openConfirmationModal(actionQuestion: string) {
    this.actionQuestion = actionQuestion;
    this.isConfirmationModalOpen = true;
  }

  handleConfirmation(result: boolean) {
    if (result) {
      this.deleteAccount();
    } else {
    }
    this.isConfirmationModalOpen = false;
  }

  isFormValid(): boolean {
    return (
      this.accountFormData.title !== '' &&
      this.accountFormData.currency_id !== 0 &&
      this.accountFormData.bank_id !== 0 &&
      this.accountFormData.kind !== ''
    );
  }

  clearForm() {
    this.accountFormData = {
      title: '',
      currency_id: 0,
      bank_id: 0,
      invest: false,
      kind: '',
    };
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
        .post('/api/money/account', this.accountFormData, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Счёт успешно cоздан', 'success');
            this.clearForm();
            this.emitAccountsChanged();
          },
          error: (error) => {
            console.error('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при создании счёта', 'error');
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  updateAccount() {
    if (this.token) {
      this.http
        .put(`/api/money/account/${this.accountFormData.id}`, this.accountFormData, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Счёт успешно изменён', 'success');
            this.emitAccountsChanged();
          },
          error: (error) => {
            console.error('Ошибка при обновлении счёта:', error);
            this.notificationsService.addNotification('Ошибка при обновлении счёта', 'error');
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  deleteAccount() {
    if (this.token) {
      this.http
        .delete(`/api/money/account/${this.accountFormData.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Счёт успешно удалён', 'success');
            this.emitAccountsChanged();
          },
          error: (error) => {
            console.error('Ошибка при удалении счёта:', error);
            this.notificationsService.addNotification('Ошибка при удалении счёта', 'error');
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  ngOnInit(): void {
    if (this.formRole === 'edit') {
      const currency = this.currencyList.find((c) => c.id === this.accountFormData.currency_id);
      const bank = this.bankList.find((b) => b.id === this.accountFormData.bank_id);

      if (currency && currency.id !== undefined) {
        this.accountFormData.currency_id = currency.id;
      } else {
        this.accountFormData.currency_id = 0;
      }

      if (bank && bank.id !== undefined) {
        this.accountFormData.bank_id = bank.id;
      } else {
        this.accountFormData.bank_id = 0;
      }
    }
  }

  ngAfterViewInit(): void {}
}
