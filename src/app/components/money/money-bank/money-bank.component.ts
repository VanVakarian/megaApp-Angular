import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatAccordion } from '@angular/material/expansion';

import { Bank } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DataSharingService } from 'src/app/services/data-sharing.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { FormBankComponent } from '../form-bank/form-bank.component';

@Component({
  selector: 'app-money-bank',
  templateUrl: './money-bank.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*', minHeight: '*' })),
      transition('expanded <=> collapsed', animate('100ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class MoneyBankComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('newBankDiv') newBankDiv!: ElementRef;
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  @ViewChild('childInput', { static: false }) childInput!: ElementRef;
  @ViewChild(FormBankComponent) formBank!: FormBankComponent;

  token = this.auth.getToken();
  banks: Bank[] = [];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private dataSharingService: DataSharingService,
    private notificationsService: NotificationsService,
  ) {}

  closeAllPanels() {
    this.accordion.closeAll();
  }

  bankExpanded(bankId: number) {
    this.dataSharingService.bankClicked$.emit(bankId);
  }

  banksRequest() {
    if (this.token) {
      this.http
        .get<{ bank_list: Bank[] }>('/api/money/bank', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (response) => {
            // console.log('Ответ от сервера:', response);
            // this.notificationsService.addNotification('Ответ от сервера получен', 'success');
            this.banks = response.bank_list;
            // this.myForm.setValue({banks: response.bank_list});
          },
          error: (error) => {
            console.log('Ошибка при запросе:', error);
            this.notificationsService.addNotification('Ошибка при запросе банков', 'error');
          },
        });
    } else {
      console.log('Токен не найден. Пользователь не авторизован.');
      this.notificationsService.addNotification('Токен не найден. Пользователь не авторизован.', 'error');
    }
  }

  ngOnInit(): void {
    this.banksRequest();

    this.dataSharingService.banksChanged$.subscribe(() => {
      this.banksRequest();
      this.closeAllPanels();
    });
  }

  ngAfterViewInit() {}

  ngAfterViewChecked() {}
}
