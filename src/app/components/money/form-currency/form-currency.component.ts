import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CurrencyFormData } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-form-currency',
  templateUrl: './form-currency.component.html',
})
export class FormCurrencyComponent implements OnInit, AfterViewInit {
  constructor(private http: HttpClient, public auth: AuthService) {}
  token = this.auth.getToken();

  @Input() currencyFormData: CurrencyFormData = {
    name: '',
    ticker: '',
    symbol: '',
    symbol_pos: 'prefix',
    whitespace: false,
  };
  @Input() formRole: string = '';
  @Output() currencyChanged = new EventEmitter<void>();
  @Output() confirmationModalOpen = new EventEmitter<boolean>();

  isConfirmationModalOpen: boolean = false;
  actionQuestion: string = '';

  openConfirmationModal(actionQuestion: string) {
    this.actionQuestion = actionQuestion;
    this.isConfirmationModalOpen = true;
  }

  handleConfirmation(result: boolean) {
    if (result) {
      this.deleteCurrency();
    } else {
    }
    this.isConfirmationModalOpen = false;
  }

  isFormValid(): boolean {
    return (
      this.currencyFormData.name !== '' && this.currencyFormData.ticker !== '' && this.currencyFormData.symbol !== '' && this.currencyFormData.symbol_pos !== ''
    );
  }

  clearForm() {
    this.currencyFormData = {
      name: '',
      ticker: '',
      symbol: '',
      symbol_pos: 'prefix',
      whitespace: false,
    };
  }

  onSubmit() {
    if (this.formRole === 'new') {
      this.createCurrency();
    } else if (this.formRole === 'edit') {
      this.updateCurrency();
    }
  }

  createCurrency() {
    if (this.token) {
      this.http
        .post('/api/money/currency', this.currencyFormData, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.clearForm();
            this.currencyChanged.emit();
          },
          error: (error) => {
            console.error('Ошибка при запросе:', error);
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
    }
  }

  updateCurrency() {
    if (this.token) {
      this.http
        .put(`/api/money/currency/${this.currencyFormData.id}`, this.currencyFormData, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.currencyChanged.emit();
          },
          error: (error) => {
            console.error('Ошибка при запросе:', error);
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
    }
  }

  deleteCurrency() {
    if (this.token) {
      this.http
        .delete(`/api/money/currency/${this.currencyFormData.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Валюта успешно удалена:', response);
            this.currencyChanged.emit();
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
