// import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { AuthService } from 'src/app/services/auth/auth.service';
// import { MoneyCurrencyComponent } from '../money-currency/money-currency.component';

@Component({
  selector: 'app-money-accounts',
  templateUrl: './money-accounts.component.html',
  styleUrls: ['./money-accounts.component.scss'],
})
export class MoneyAccountsComponent implements OnInit {
  ngOnInit(): void {}

  componentsOpenState: { [key: string]: boolean } = { currency: false, accounts: false, banks: false };

  toggleTab(tabName: string) {
    for (const tab in this.componentsOpenState) {
      if (tab === tabName) {
        this.componentsOpenState[tab] = !this.componentsOpenState[tab];
      } else {
        this.componentsOpenState[tab] = false;
      }
    }
  }
}
