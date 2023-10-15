import { MainAppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ModalYNComponent } from './components/shared/modal-y-n/modal-y-n.component';

import { KcalsPageComponent } from './components/kcals-page/kcals-page.component';

import { MoneyDashboardComponent } from './components/money/money-dashboard/money-dashboard.component';
import { MoneyManageComponent } from './components/money/money-manage/money-manage.component';
import { MoneyCurrencyComponent } from './components/money/money-currency/money-currency.component';
import { FormCurrencyComponent } from './components/money/form-currency/form-currency.component';
import { MoneyBankComponent } from './components/money/money-bank/money-bank.component';
import { FormBankComponent } from './components/money/form-bank/form-bank.component';
import { MoneyAccountComponent } from './components/money/money-account/money-account.component';
import { FormAccountComponent } from './components/money/form-account/form-account.component';

import { MoneyTransactionsComponent } from './components/money/money-transactions/money-transactions.component';

import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';

import { NotificationsComponent } from './components/shared/notifications/notifications.component';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthService } from './services/auth/auth.service';
import { AuthGuard } from './services/auth/auth.guard';
import { NotificationsService } from './services/notifications.service';

@NgModule({
  declarations: [
    MainAppComponent,
    NavbarComponent,
    ModalYNComponent,

    KcalsPageComponent,

    MoneyDashboardComponent,
    MoneyManageComponent,
    MoneyCurrencyComponent,
    FormCurrencyComponent,
    MoneyBankComponent,
    FormBankComponent,
    MoneyAccountComponent,
    FormAccountComponent,

    MoneyTransactionsComponent,

    SettingsPageComponent,
    LoginPageComponent,
    RegisterPageComponent,

    NotificationsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
  ],
  bootstrap: [MainAppComponent],
  providers: [AuthService, AuthGuard, NotificationsService],
})
export class AppModule {}
