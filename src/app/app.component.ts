import { Component, OnInit, ViewChild } from '@angular/core';
import { NotificationsService } from './services/notifications.service';
import { MoneyService } from './services/money.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class MainAppComponent implements OnInit {
  title = 'megaapp';

  menuOpened = false;

  constructor(public moneyService: MoneyService) {}

  hamburgerPressed(hamburgerCheckboxStatus: boolean) {
    this.menuOpened = hamburgerCheckboxStatus;
  }

  closeMenu() {
    this.menuOpened = false;
  }

  ngOnInit(): void {
    this.moneyService.getCurrencies();
    this.moneyService.getBanks();
    this.moneyService.getAccounts();
    this.moneyService.getCategories();
    this.moneyService.getTransactions(null);
  }

  // // FOR TESTING PERPOSES
  // constructor(private notificationsService: NotificationsService) {}
  // showNotification() {
  //   this.notificationsService.addNotification('Ошибка произошла', 'error', 0);
  //   this.notificationsService.addNotification('Внимание, внимание, внимание!', 'warning', 0);
  //   this.notificationsService.addNotification('Надо же! Все океюшки!', 'success', 0);
  //   this.notificationsService.addNotification('Просто сообщение с обычной, ничем не примечательной информацией, вот!', 'info', 0);
  // }
  // <button
  //   (click)="showNotification()"
  //   class="fixed bottom-4 right-4 rounded bg-blue-500 px-4 py-2 text-white"
  // >
  //   Показать уведомление
  // </button>
}
