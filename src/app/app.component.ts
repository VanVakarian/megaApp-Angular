import { Component, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';

import { MoneyService } from 'src/app/services/money.service';
import { FoodService } from 'src/app/services/food.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class MainAppComponent implements OnInit {
  title = 'megaapp';

  menuOpened = false;

  constructor(
    public moneyService: MoneyService,
    public foodService: FoodService,
    private dateAdapter: DateAdapter<Date>
  ) {}

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
    this.foodService.getFullUpdate();
    this.foodService.getStats();

    this.moneyService.getCurrencies();
    this.moneyService.getBanks();
    this.moneyService.getAccounts();
    this.moneyService.getCategories();
    this.moneyService.getTransactions();
  }
}
