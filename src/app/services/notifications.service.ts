import { Injectable } from '@angular/core';
import { Notification } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  notifications: Notification[] = [];
  currentId = 0;

  bgColourTable = {
    error: 'bg-red-600',
    warning: 'bg-yellow-400',
    success: 'bg-green-600',
    info: 'bg-white',
  };
  textColourTable = {
    error: 'text-white',
    warning: 'text-black',
    success: 'text-white',
    info: 'text-black',
  };

  addNotification(message: string, notiffKind: string, time: number = 0) {
    const bgColourKey = this.bgColourTable[notiffKind as keyof typeof this.bgColourTable];
    const bgColour = bgColourKey ? bgColourKey : 'white';

    const textColourKey = this.textColourTable[notiffKind as keyof typeof this.textColourTable];
    const textColour = textColourKey ? textColourKey : 'black';

    const id = this.currentId++;
    this.notifications.push({ id, message, bgColour, textColour, time });

    if (time === 0) {
      setTimeout(() => this.removeNotification(id), (1 + message.length / 20) * 1000);
    } else if (time > 0) {
      setTimeout(() => this.removeNotification(id), time * 1000);
    }
  }

  removeNotification(id: number) {
    this.notifications = this.notifications.filter((notification) => notification.id !== id);
  }
}
