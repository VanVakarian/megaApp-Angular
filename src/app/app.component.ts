import { Component, OnInit } from '@angular/core';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { NavbarDesktopComponent } from 'src/app/components/main-menu/navbar-desktop/navbar-desktop.component';
import { NavbarMobileComponent } from 'src/app/components/main-menu/navbar-mobile/navbar-mobile.component';
import { PaginatorLocalisation } from 'src/app/paginator-localisation';
import { AuthService } from 'src/app/services/auth.service';
import { NetworkMonitor } from 'src/app/services/network-monitor.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarMobileComponent,
    NavbarDesktopComponent,
    RouterOutlet,
    MatNativeDateModule,
  ],
  templateUrl: './app.component.html',
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: PaginatorLocalisation
    },
  ],
})
export class MainAppComponent implements OnInit {
  constructor(
    private dateAdapter: DateAdapter<Date>,
    public authService: AuthService,
    private settingsService: SettingsService,
    public networkMonitorService: NetworkMonitor,
  ) {
    this.authService.initCheckToken();
    this.networkMonitorService.initNetworkEvents();
  }

  ngOnInit(): void {
    this.makeMondayFirstDayOfWeek();

    firstValueFrom(this.settingsService.getSettings());
  }

  private makeMondayFirstDayOfWeek() {
    this.dateAdapter.setLocale('ru-RU');
    this.dateAdapter.getFirstDayOfWeek = () => 1;
  }
}
