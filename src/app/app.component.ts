import { Component, OnInit } from '@angular/core';
import { MoneyService } from './services/money.service';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class MainAppComponent implements OnInit {
  title = 'megaapp';

  menuOpened = false;

  constructor(public moneyService: MoneyService, private dateAdapter: DateAdapter<Date>) {}

  hamburgerPressed(hamburgerCheckboxStatus: boolean) {
    this.menuOpened = hamburgerCheckboxStatus;
  }

  closeMenu() {
    this.menuOpened = false;
  }

  ngOnInit(): void {
    // making monday to be the first day of the week in a calendar
    this.dateAdapter.setLocale('ru-RU');
    this.dateAdapter.getFirstDayOfWeek = () => {
      return 1;
    };

    // TODO: think of a better way to initially fetch data
    this.moneyService.getCurrencies();
    this.moneyService.getBanks();
    this.moneyService.getAccounts();
    this.moneyService.getCategories();
    this.moneyService.getTransactions();
  }
}
