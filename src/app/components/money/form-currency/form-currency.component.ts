import { AfterViewInit, Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Currency } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ConfirmationDialogService } from 'src/app/services/mat-dialog-modal.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-form-currency',
  templateUrl: './form-currency.component.html',
})
export class FormCurrencyComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() currencyData!: Currency;
  @Input() formRole: string = '';
  @ViewChild('inputTitle') inputTitleElem!: ElementRef;

  token = this.auth.getToken();

  currencyForm = new FormGroup({
    id: new FormControl(0),
    title: new FormControl('', [Validators.required]),
    ticker: new FormControl('', [Validators.required]),
    symbol: new FormControl('', [Validators.required]),
    symbol_pos: new FormControl('prefix'),
    whitespace: new FormControl(false),
  });
  private currencyClickedSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService,
    private fb: FormBuilder,
    private confirmModal: ConfirmationDialogService,
    private utils: UtilsService
  ) {
    this.currencyClickedSubscription = this.dataSharingService.currencyClicked$.subscribe(async (currencyId) => {
      if (this.currencyForm.value.id === currencyId) {
        await this.setFocusOnInput();
      }
    });
  }

  async setFocusOnInput() {
    await this.utils.sleep(100); // await is the duration of the panel expansion animation, otherwise focus messes with it.
    this.inputTitleElem.nativeElement.focus();
  }

  emitcurrenciesChanged$() {
    this.dataSharingService.currenciesChanged$.emit();
  }

  openConfirmationModal(actionQuestion: string): void {
    this.confirmModal.openModal(actionQuestion).subscribe((result) => {
      if (result) {
        this.deleteCurrency();
      }
    });
  }

  isFormValid(): boolean {
    return this.currencyForm.valid;
  }

  clearForm(): void {
    this.currencyForm.reset();
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
        .post('/api/money/currency', this.currencyForm.value, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Валюта успешно cоздана', 'success');
            this.clearForm();
            this.emitcurrenciesChanged$();
          },
          error: (error) => {
            console.log('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при создании валюты', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  updateCurrency() {
    if (this.token) {
      this.http
        .put(`/api/money/currency/${this.currencyData.id}`, this.currencyData, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Валюта успешно изменена', 'success');
            this.emitcurrenciesChanged$();
          },
          error: (error) => {
            console.log('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при обновлении валюты', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  deleteCurrency() {
    if (this.token) {
      this.http
        .delete(`/api/money/currency/${this.currencyData.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Валюта успешно удалена:', response);
            this.notificationsService.addNotification('Валюта успешно удалена', 'success');
            this.emitcurrenciesChanged$();
          },
          error: (error) => {
            console.log('Ошибка при удалении валюты:', error);
            this.notificationsService.addNotification('Ошибка при удалении валюты', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(): void {
    if (this.currencyData) {
      this.currencyForm.patchValue(this.currencyData)
    }
  }

  ngOnDestroy(): void {
    this.currencyClickedSubscription.unsubscribe();
  }
}
