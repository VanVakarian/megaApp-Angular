import { AfterViewInit, Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Bank } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ConfirmationDialogService } from 'src/app/services/mat-dialog-modal.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-form-bank',
  templateUrl: './form-bank.component.html',
})
export class FormBankComponent implements OnInit, OnChanges, OnDestroy {
  @Input() bankData!: Bank;
  @Input() formRole: string = '';
  
  @ViewChild('inputTitle') inputTitleElem!: ElementRef;

  token = this.auth.getToken();
  
  bankForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    title: new FormControl('', Validators.required),
  });

  private bankClickedSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService,
    private confirmModal: ConfirmationDialogService,
    private utils: UtilsService
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

  emitbanksChanged$(): void {
    this.dataSharingService.banksChanged$.emit();
  }

  openConfirmationModal(actionQuestion: string): void {
    this.confirmModal.openModal(actionQuestion).subscribe((result) => {
      if (result) {
        this.deleteBank();
      }
    });
  }

  isFormValid(): boolean {
    return this.bankForm.valid;
  }

  clearForm(): void {
    this.bankForm.reset();
  }

  onSubmit(): void {
    if (this.formRole === 'new') {
      this.createBank();
    } else if (this.formRole === 'edit') {
      this.updateBank();
    }
  }

  createBank(): void {
    if (this.token) {
      this.http
        .post('/api/money/bank', this.bankForm.value, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Банк успешно cоздан', 'success');
            this.clearForm();
            this.emitbanksChanged$();
          },
          error: (error) => {
            console.log('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при создании банка', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  updateBank(): void {
    if (this.token) {
      this.http
        .put(`/api/money/bank/${this.bankForm.value.id}`, this.bankForm.value, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Банк успешно изменён', 'success');
            this.emitbanksChanged$();
          },
          error: (error) => {
            console.log('Ошибка при обновлении валюты:', error);
            this.notificationsService.addNotification('Ошибка при обновлении банка', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  deleteBank(): void {
    if (this.token) {
      this.http
        .delete(`/api/money/bank/${this.bankForm.value.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Банк успешно удалён', 'success');
            this.emitbanksChanged$();
          },
          error: (error) => {
            console.log('Ошибка при удалении валюты:', error);
            this.notificationsService.addNotification('Ошибка при удалении банка', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
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
