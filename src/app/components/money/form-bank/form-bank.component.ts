import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BankFormData } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-form-bank',
  templateUrl: './form-bank.component.html',
})
export class FormBankComponent implements OnInit, AfterViewInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}
  token = this.auth.getToken();

  emitBanksChanged() {
    // console.log('emitBanksChanged');
    this.dataSharingService.banksChanged.emit();
  }

  @Input() bankFormData: BankFormData = {
    title: '',
  };
  @Input() formRole: string = '';
  @Output() bankChanged = new EventEmitter<void>();
  @Output() confirmationModalOpen = new EventEmitter<boolean>();

  isConfirmationModalOpen: boolean = false;
  actionQuestion: string = '';

  openConfirmationModal(actionQuestion: string) {
    this.actionQuestion = actionQuestion;
    this.isConfirmationModalOpen = true;
  }

  handleConfirmation(result: boolean) {
    if (result) {
      this.deleteBank();
    } else {
    }
    this.isConfirmationModalOpen = false;
  }

  isFormValid(): boolean {
    return this.bankFormData.title !== '';
  }

  clearForm() {
    this.bankFormData = {
      title: '',
    };
  }

  onSubmit() {
    if (this.formRole === 'new') {
      this.createBank();
    } else if (this.formRole === 'edit') {
      this.updateBank();
    }
  }

  createBank() {
    if (this.token) {
      this.http
        .post('/api/money/bank', this.bankFormData, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Банк успешно cоздан', 'success');
            this.clearForm();
            this.emitBanksChanged();
          },
          error: (error) => {
            console.error('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при создании банка', 'error');
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  updateBank() {
    if (this.token) {
      this.http
        .put(`/api/money/bank/${this.bankFormData.id}`, this.bankFormData, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Банк успешно изменён', 'success');
            this.emitBanksChanged();
          },
          error: (error) => {
            console.error('Ошибка при обновлении валюты:', error);
            this.notificationsService.addNotification('Ошибка при обновлении банка', 'error');
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  deleteBank() {
    if (this.token) {
      this.http
        .delete(`/api/money/bank/${this.bankFormData.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Банк успешно удалён', 'success');
            this.emitBanksChanged();
          },
          error: (error) => {
            console.error('Ошибка при удалении валюты:', error);
            this.notificationsService.addNotification('Ошибка при удалении банка', 'error');
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {}
}
