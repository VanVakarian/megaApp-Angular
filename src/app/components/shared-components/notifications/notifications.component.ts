import { Component } from '@angular/core';
import { NotificationsService } from '../../../services/notifications.service';
import { slideInOutAnimation } from './notifications.animations';
import { Notification } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  animations: [slideInOutAnimation],
})
export class NotificationsComponent {
  constructor(public notificationsService: NotificationsService) {}

  removeNotification(notification: Notification) {
    this.notificationsService.removeNotification(notification.id);
  }
}
