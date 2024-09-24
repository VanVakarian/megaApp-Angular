import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { FoodStatsComponent } from 'src/app/components/food/stats/food-stats.component';
import { FoodDiaryComponent } from 'src/app/components/food/diary/food-diary.component';
import { FoodCatalogueComponent } from 'src/app/components/food/catalogue/food-catalogue.component';
import { FoodService } from 'src/app/services/food.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-food-screen',
  standalone: true,
  imports: [NgIf, FoodStatsComponent, FoodDiaryComponent, FoodCatalogueComponent],
  templateUrl: './food-screen.component.html',
})
export class FoodScreenComponent implements OnInit {
  section: string;
  largeScreen: boolean;
  private mediaQueryList: MediaQueryList;

  constructor(
    private route: ActivatedRoute,
    private foodService: FoodService,
  ) {
    this.section = '';
    this.largeScreen = false;
    this.mediaQueryList = window.matchMedia('(min-width: 1024px)');
  }

  ngOnInit() {
    firstValueFrom(this.foodService.getFoodDiaryFullUpdateRange(undefined, 2));
    firstValueFrom(this.foodService.getCatalogueEntries());
    firstValueFrom(this.foodService.getMyCatalogueEntries());

    this.updateScreenSize();
    this.mediaQueryList.addEventListener('change', this.updateScreenSize.bind(this));

    this.route.params.subscribe((params) => {
      this.section = params['section'] || 'diary';
    });
  }

  ngOnDestroy() {
    this.mediaQueryList.removeEventListener('change', this.updateScreenSize.bind(this));
  }

  private updateScreenSize(event?: MediaQueryListEvent) {
    this.largeScreen = event ? event.matches : this.mediaQueryList.matches;
  }
}
