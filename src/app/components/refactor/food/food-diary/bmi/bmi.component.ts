import { Component, Input } from '@angular/core';

import { FoodService } from 'src/app/components/refactor/service/food.service';

@Component({
  selector: 'app-bmi',
  templateUrl: './bmi.component.html',
})
export class BmiComponent {
  @Input() selectedDateISO: string = '';

  constructor(public foodService: FoodService) {}

  setBmiKgBorderValue(idx: number) {
    return this.foodService.bmi$$()?.['bmiKgs']?.[idx];
  }

  setBmiWidth(idx: number) {
    return {
      width: `${this.foodService.bmi$$()?.['widthFractions'][idx] * 100}%`,
    };
  }
}
