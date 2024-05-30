import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
// import { MatSidenavContent } from '@angular/material/sidenav';

import { NavbarMobileComponent } from './components/navbars/navbar-mobile/navbar-mobile.component';
import { NavbarDesktopComponent } from './components/navbars/navbar-desktop/navbar-desktop.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarDesktopComponent, NavbarMobileComponent, RouterOutlet, MatNativeDateModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class MainAppComponent implements OnInit {
  // @ViewChild('scrollable') scrollable!: MatSidenavContent;

  title = 'megaapp';

  menuOpened = false;

  // public foodService: FoodService, // public moneyService: MoneyService,
  constructor(private dateAdapter: DateAdapter<Date>) {
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
    this.dateAdapter.setLocale('ru-RU');
    this.dateAdapter.getFirstDayOfWeek = () => {
      return 1;
    };
  }
}
