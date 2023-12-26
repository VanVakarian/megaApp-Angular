import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { SettingsPageComponent } from 'src/app/components/settings-page/settings-page.component';
import { RegisterPageComponent } from 'src/app/components/register-page/register-page.component';
import { FoodDiaryComponent } from 'src/app/components/food/food-diary/food-diary.component';
import { FoodCatalogueComponent } from './components/food/food-catalogue/food-catalogue.component';
import { MoneyDashboardComponent } from 'src/app/components/money/money-dashboard/money-dashboard.component';
import { MoneyManageComponent } from 'src/app/components/money/money-manage/money-manage.component';
import { MoneyTransactionsComponent } from 'src/app/components/money/money-transactions/money-transactions.component';
import { LoginPageComponent } from 'src/app/components/login-page/login-page.component';
import { AuthGuard } from 'src/app/services/auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'food-diary', pathMatch: 'full' },
  { path: 'food-diary', component: FoodDiaryComponent, canActivate: [AuthGuard] },
  { path: 'food-catalogue', component: FoodCatalogueComponent, canActivate: [AuthGuard] },
  { path: 'money-dashboard', component: MoneyDashboardComponent, canActivate: [AuthGuard] },
  { path: 'money-transactions', component: MoneyTransactionsComponent, canActivate: [AuthGuard] },
  { path: 'money-manage', component: MoneyManageComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsPageComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
})
export class AppRoutingModule {}
