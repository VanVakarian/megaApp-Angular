import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { SettingsPageComponent } from 'src/app/components/settings-page/settings-page.component';
import { RegisterPageComponent } from 'src/app/components/register-page/register-page.component';
import { KcalFoodComponent } from 'src/app/components/kcal/food/kcal-food.component';
import { MoneyDashboardComponent } from 'src/app/components/money/money-dashboard/money-dashboard.component';
import { MoneyManageComponent } from 'src/app/components/money/money-manage/money-manage.component';
import { MoneyTransactionsComponent } from 'src/app/components/money/money-transactions/money-transactions.component';
import { LoginPageComponent } from 'src/app/components/login-page/login-page.component';
import { AuthGuard } from 'src/app/services/auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'kcals', component: KcalFoodComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: MoneyDashboardComponent, canActivate: [AuthGuard] },
  { path: 'manage', component: MoneyManageComponent, canActivate: [AuthGuard] },
  { path: 'transactions', component: MoneyTransactionsComponent, canActivate: [AuthGuard] },
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
