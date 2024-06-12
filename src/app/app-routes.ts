import { Routes } from '@angular/router';

import { isAuthed } from 'src/app/services/is-authed.guard';
import { isChapterSelected } from 'src/app/services/is-chapter-selected.guard';

import { FoodScreenComponent } from 'src/app/components/food/food-screen.component';
import { MoneyScreenComponent } from 'src/app/components/money/money-screen.component';
import { SettingsPageComponent } from 'src/app/components/settings/settings-page.component';

export const routes: Routes = [
  { path: 'food', component: FoodScreenComponent, canActivate: [isAuthed, isChapterSelected] },
  { path: 'food/:section', component: FoodScreenComponent, canActivate: [isAuthed, isChapterSelected] },
  { path: 'money', component: MoneyScreenComponent, canActivate: [isAuthed, isChapterSelected] },
  { path: 'settings', component: SettingsPageComponent },
  { path: '', redirectTo: 'food', pathMatch: 'full' },
  { path: '**', redirectTo: 'food', pathMatch: 'full' },
];
