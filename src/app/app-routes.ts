import { Routes } from '@angular/router';

import { canActivateAuth } from 'src/app/services/auth.guard';
import { FoodScreenComponent } from 'src/app/components/food/food-screen.component';
import { MoneyScreenComponent } from 'src/app/components/money/money-screen.component';
import { SettingsPageComponent } from 'src/app/components/settings/settings-page.component';

export const routes: Routes = [
  { path: 'food', component: FoodScreenComponent, canActivate: [canActivateAuth] },
  { path: 'food/:section', component: FoodScreenComponent, canActivate: [canActivateAuth] },
  { path: 'money', component: MoneyScreenComponent, canActivate: [canActivateAuth] },
  { path: 'settings', component: SettingsPageComponent },
  { path: '', redirectTo: 'food', pathMatch: 'full' },
  { path: '**', redirectTo: 'food', pathMatch: 'full' },
];
