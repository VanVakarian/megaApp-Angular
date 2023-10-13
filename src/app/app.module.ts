import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MainAppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';

import { KcalsPageComponent } from './components/kcals-page/kcals-page.component';

import { MoneyDashboardComponent } from './components/money/money-dashboard/money-dashboard.component';
import { MoneyAccountsComponent } from './components/money/money-accounts/money-accounts.component';
import { MoneyCurrencyComponent } from './components/money/money-currency/money-currency.component';
import { FormCurrencyComponent } from './components/money/form-currency/form-currency.component';
import { MoneyBankComponent } from './components/money/money-bank/money-bank.component';
import { FormBankComponent } from './components/money/form-bank/form-bank.component';

import { MoneyTransactionsComponent } from './components/money/money-transactions/money-transactions.component';

import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { ModalYNComponent } from './components/shared/modal-y-n/modal-y-n.component';

import { AuthGuard } from './services/auth/auth.guard';
import { AuthService } from './services/auth/auth.service';

@NgModule({
  declarations: [
    MainAppComponent,
    NavbarComponent,

    KcalsPageComponent,
    
    MoneyDashboardComponent,
    MoneyAccountsComponent,
    MoneyCurrencyComponent,
    FormCurrencyComponent,
    MoneyBankComponent,
    FormBankComponent,

    MoneyTransactionsComponent,

    SettingsPageComponent,
    LoginPageComponent,
    RegisterPageComponent,
    ModalYNComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, HttpClientModule, FormsModule],
  bootstrap: [MainAppComponent],
  providers: [AuthService, AuthGuard],
})
export class AppModule {}
