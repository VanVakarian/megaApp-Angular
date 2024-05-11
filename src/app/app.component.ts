import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { delay } from 'rxjs';
import { DateAdapter } from '@angular/material/core';
import { MatSidenavContent } from '@angular/material/sidenav';

import { MoneyService } from 'src/app/services/money.service';
import { FoodService } from 'src/app/services/food.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class MainAppComponent implements OnInit {
  @ViewChild('scrollable') scrollable!: MatSidenavContent;

  title = 'megaapp';

  menuOpened = false;

  constructor(
    // public moneyService: MoneyService,
    // public foodService: FoodService,
    // private dateAdapter: DateAdapter<Date>
  ) {
    // this.foodService.diaryEntryClickedScroll$
    //   .pipe(
    //     delay(190) // Waiting for expansion panel animation to finish before scrolling. Otherwise it scrolls to the wrong place.
    //   )
    //   .subscribe((clickedElem: ElementRef) => {
    //     const scrollPx = clickedElem.nativeElement.getBoundingClientRect().top - 50;
    //     this.scrollable.getElementRef().nativeElement.scrollBy({ top: scrollPx, behavior: 'smooth' });
    //   });
  }

  hamburgerPressed(hamburgerCheckboxStatus: boolean) {
    this.menuOpened = hamburgerCheckboxStatus;
  }

  closeMenu() {
    this.menuOpened = false;
  }

  ngOnInit(): void {
    // making monday to be the first day of the week in a calendar
    // this.dateAdapter.setLocale('ru-RU');
    // this.dateAdapter.getFirstDayOfWeek = () => {
    //   return 1;
    // };

    // TODO: think of a better way to initially fetch data
    // this.foodService.getFullUpdate();
    // this.foodService.getStats();

    // this.moneyService.getCurrencies();
    // this.moneyService.getBanks();
    // this.moneyService.getAccounts();
    // this.moneyService.getCategories();
    // this.moneyService.getTransactions();
  }
}
