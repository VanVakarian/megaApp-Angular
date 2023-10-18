import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CategoryFormData } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-form-category',
  templateUrl: './form-category.component.html',
})
export class FormCategoryComponent implements OnInit, AfterViewInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService
  ) {}
  token = this.auth.getToken();

  emitCategoriesChanged() {
    this.dataSharingService.categoriesChanged.emit();
  }

  @Input() categoryFormData: CategoryFormData = {
    id: null,
    title: '',
    kind: '',
    parent_id: null,
  };
  @Input() formKind: string = '';
  @Input() formParent: number | null = null;
  @Input() formRole: string = '';
  @Input() formLevel: string = '';
  @Output() toggleAddSubCategoryClicked = new EventEmitter<void>();

  isConfirmationModalOpen: boolean = false;
  actionQuestion: string = '';

  toggleAddSubCategory() {
    // console.log('lolkek toggleAddSubCategoryClicked');
    this.toggleAddSubCategoryClicked.emit();
  }

  openConfirmationModal(actionQuestion: string) {
    this.actionQuestion = actionQuestion;
    this.isConfirmationModalOpen = true;
  }

  handleConfirmation(result: boolean) {
    if (result) {
      this.deleteCategory();
    } else {
    }
    this.isConfirmationModalOpen = false;
  }

  isFormValid(): boolean {
    return this.categoryFormData.title !== '';
  }

  clearForm() {
    this.categoryFormData = {
      id: null,
      title: '',
      kind: '',
      parent_id: null,
    };
  }

  onSubmit() {
    // console.log(this.formKind)
    this.categoryFormData.kind = this.formKind;
    if (this.formParent) {
      this.categoryFormData.parent_id = this.formParent;
    } 
    // console.log(this.categoryFormData)
    if (this.formRole === 'new') {
      this.createCategory();
    } else if (this.formRole === 'edit') {
      this.updateCategory();
    }
  }

  createCategory() {
    if (this.token) {
      this.http
        .post('/api/money/category', this.categoryFormData, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            // this.notificationsService.addNotification('Категория успешно cоздана', 'success');
            this.clearForm();
            this.emitCategoriesChanged();
          },
          error: (error) => {
            console.error('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при создании категории', 'error');
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  updateCategory() {
    if (this.token) {
      this.http
        .put(`/api/money/category/${this.categoryFormData.id}`, this.categoryFormData, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Категория успешно изменена', 'success');
            this.emitCategoriesChanged();
          },
          error: (error) => {
            console.error('Ошибка при обновлении категории:', error);
            this.notificationsService.addNotification('Ошибка при обновлении категории', 'error');
          },
        });
    } else {
      console.error('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  deleteCategory() {
    console.log('lolkek06');
    if (this.token) {
      this.http
        .delete(`/api/money/category/${this.categoryFormData.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            this.notificationsService.addNotification('Категория успешно удаленa', 'success');
            this.emitCategoriesChanged();
          },
          error: (error) => {
            console.error('Ошибка при удалении валюты:', error);
            this.notificationsService.addNotification('Ошибка при удалении категории', 'error');
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
