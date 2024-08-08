import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DateAdapter, MatNativeDateModule } from '@angular/material/core';

import { NavbarMobileComponent } from 'src/app/components/main-menu/navbar-mobile/navbar-mobile.component';
import { NavbarDesktopComponent } from 'src/app/components/main-menu/navbar-desktop/navbar-desktop.component';
import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';
import { NetworkMonitor } from 'src/app/services/network-monitor.service';
// import { ActionService } from 'src/app/services/action.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarMobileComponent, NavbarDesktopComponent, RouterOutlet, MatNativeDateModule],
  templateUrl: './app.component.html',
})
export class MainAppComponent implements OnInit {
  constructor(
    private dateAdapter: DateAdapter<Date>,
    public authService: AuthService,
    private settingsService: SettingsService,
    public networkMonitorService: NetworkMonitor,
    // public actionService: ActionService,
  ) {
    this.authService.initCheckToken();
    this.networkMonitorService.initNetworkEvents();
    // this.actionService.initService();
  }

  ngOnInit(): void {
    // making monday to be the first day of the week in a calendar
    this.dateAdapter.setLocale('ru-RU');
    this.dateAdapter.getFirstDayOfWeek = () => 1;

    this.settingsService.getSettings().subscribe();
  }
}
