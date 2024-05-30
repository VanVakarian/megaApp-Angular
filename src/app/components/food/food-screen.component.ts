import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FoodStatsComponent } from './stats/food-stats.component';
import { FoodDiaryComponent } from './diary/food-diary.component';
import { FoodCatalogueComponent } from './catalogue/food-catalogue.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-food-screen',
  standalone: true,
  imports: [NgIf, FoodStatsComponent, FoodDiaryComponent, FoodCatalogueComponent],
  templateUrl: './food-screen.component.html',
  styleUrls: ['./food-screen.component.scss'],
})
export class FoodScreenComponent implements OnInit {
  section: string;
  largeScreen: boolean;
  private mediaQueryList: MediaQueryList;

  constructor(private route: ActivatedRoute) {
    this.section = '';
    this.largeScreen = false;
    this.mediaQueryList = window.matchMedia('(min-width: 1024px)');
  }

  ngOnInit() {
    this.updateScreenSize();
    this.mediaQueryList.addEventListener('change', this.updateScreenSize.bind(this));

    this.route.params.subscribe((params) => {
      this.section = params['section'] || 'diary';
    });
  }

  ngOnDestroy() {
    this.mediaQueryList.removeEventListener('change', this.updateScreenSize.bind(this));
  }

  private updateScreenSize = (event?: MediaQueryListEvent) => {
    this.largeScreen = event ? event.matches : this.mediaQueryList.matches;
  };
}
