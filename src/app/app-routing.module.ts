import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { KcalsPageComponent } from './components/kcals-page/kcals-page.component';
import { MoneyDashboardComponent } from './components/money/money-dashboard/money-dashboard.component';
import { MoneyAccountsComponent } from './components/money/money-accounts/money-accounts.component';
import { MoneyTransactionsComponent } from './components/money/money-transactions/money-transactions.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { AuthGuard } from './services/auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'kcals', component: KcalsPageComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: MoneyDashboardComponent, canActivate: [AuthGuard] },
  { path: 'accounts', component: MoneyAccountsComponent, canActivate: [AuthGuard] },
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
