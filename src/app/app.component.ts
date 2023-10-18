import { Component } from '@angular/core';
import { NotificationsService } from './services/notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class MainAppComponent {
  title = 'megaapp';

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
