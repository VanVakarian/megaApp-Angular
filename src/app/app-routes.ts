import { Routes } from '@angular/router';

import { canActivateAuth } from './services/auth/auth.guard';
import { FoodScreenComponent } from './components/food/food-screen.component';
import { MoneyScreenComponent } from './components/money/money-screen.component';

export const routes: Routes = [
  { path: 'food', component: FoodScreenComponent, canActivate: [canActivateAuth] },
  { path: 'food/:section', component: FoodScreenComponent, canActivate: [canActivateAuth] },
  { path: 'money', component: MoneyScreenComponent, canActivate: [canActivateAuth] },
  { path: '', redirectTo: 'food', pathMatch: 'full' },
  { path: '**', redirectTo: 'food', pathMatch: 'full' },
];
