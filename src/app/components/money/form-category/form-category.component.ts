import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { ConfirmationDialogService } from 'src/app/services/mat-dialog-modal.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Category } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-form-category',
  templateUrl: './form-category.component.html',
})
export class FormCategoryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() formRole: string = '';
  @Input() categoryKind: string = '';
  @Input() categoryData!: Category;

  @ViewChild('inputTitle') inputTitleElem!: ElementRef;

  token = this.auth.getToken();

  categoryForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    title: new FormControl('', Validators.required),
    kind: new FormControl(''),
  });
  
  private categoryClickedSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService,
    private confirmModal: ConfirmationDialogService,
    private utils: UtilsService
  ) {
    this.categoryClickedSubscription = this.dataSharingService.categoryClicked$.subscribe(async (categoryId) => {
      if (this.categoryForm.value.id === categoryId) {
        await this.setFocusOnInput();
      }
    });
  }

  async setFocusOnInput() {
    await this.utils.sleep(100); // await is the duration of the panel expansion animation, otherwise focus messes with it.
    this.inputTitleElem.nativeElement.focus();
  }

  openConfirmationModal(actionQuestion: string): void {
    this.confirmModal.openModal(actionQuestion).subscribe((result) => {
      if (result) {
        this.deleteCategory();
      }
    });
  }

  isFormValid(): boolean {
    return this.categoryForm.valid;
  }

  clearForm(): void {
    this.categoryForm.reset();
  }

  emitcategoriesChanged$() {
    this.dataSharingService.categoriesChanged$.emit();
  }

  onSubmit(): void {
    if (this.formRole === 'new') {
      this.createCategory();
    } else if (this.formRole === 'edit') {
      this.updateCategory();
    }
  }

  createCategory() {
    if (this.token) {
      this.http
        .post('/api/money/category', this.categoryForm.value, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            // this.notificationsService.addNotification('Категория успешно cоздана', 'success');
            this.clearForm();
            this.emitcategoriesChanged$();
          },
          error: (error) => {
            console.log('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при создании категории', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  updateCategory() {
    if (this.token) {
      this.http
        .put(`/api/money/category/${this.categoryForm.value.id}`, this.categoryForm.value, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Категория успешно изменена', 'success');
            this.emitcategoriesChanged$();
          },
          error: (error) => {
            console.log('Ошибка при обновлении категории:', error);
            this.notificationsService.addNotification('Ошибка при обновлении категории', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  deleteCategory() {
    if (this.token) {
      this.http
        .delete(`/api/money/category/${this.categoryForm.value.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Категория успешно удаленa', 'success');
            this.emitcategoriesChanged$();
          },
          error: (error) => {
            console.log('Ошибка при удалении валюты:', error);
            this.notificationsService.addNotification('Ошибка при удалении категории', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (this.categoryData) {
      this.categoryForm.patchValue(this.categoryData);
    }

    if (this.categoryKind) {
      this.categoryForm.patchValue({ kind: this.categoryKind });
    }
  }

  ngOnDestroy(): void {
    this.categoryClickedSubscription.unsubscribe();
  }
}
