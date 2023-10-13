import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BankFormData } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-form-bank',
  templateUrl: './form-bank.component.html',
})
export class FormBankComponent implements OnInit, AfterViewInit {
  constructor(private http: HttpClient, public auth: AuthService) {}
  token = this.auth.getToken();

  @Input() bankFormData: BankFormData = {
    name: '',
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
    return this.bankFormData.name !== '';
  }

  clearForm() {
    this.bankFormData = {
      name: '',
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
            this.clearForm();
            this.bankChanged.emit();
          },
          error: (error) => {
            console.error('Ошибка при запросе:', error);
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
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
            this.bankChanged.emit();
          },
          error: (error) => {
            console.error('Ошибка при запросе:', error);
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
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
            // console.log('Валюта успешно удалена:', response);
            this.bankChanged.emit();
          },
          error: (error) => {
            console.error('Ошибка при удалении валюты:', error);
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
    }
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {}
}
