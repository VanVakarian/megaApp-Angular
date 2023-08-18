import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy, registerLocaleData } from '@angular/common';

import { KcalsPageComponent } from './components/kcals-page/kcals-page.component';
import { MoneyPageComponent } from './components/money-page/money-page.component';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';


const routes: Routes = [
  { path: 'kcals', component: KcalsPageComponent },
  { path: 'money', component: MoneyPageComponent },
  { path: 'settings', component: SettingsPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }
