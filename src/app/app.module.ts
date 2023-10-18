import { MainAppComponent } from 'src/app/app.component';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { ModalYNComponent } from 'src/app/components/shared/modal-y-n/modal-y-n.component';

import { KcalsPageComponent } from 'src/app/components/kcals-page/kcals-page.component';

import { MoneyDashboardComponent } from 'src/app/components/money/money-dashboard/money-dashboard.component';
import { MoneyManageComponent } from 'src/app/components/money/money-manage/money-manage.component';
import { MoneyCurrencyComponent } from 'src/app/components/money/money-currency/money-currency.component';
import { FormCurrencyComponent } from 'src/app/components/money/form-currency/form-currency.component';
import { MoneyBankComponent } from 'src/app/components/money/money-bank/money-bank.component';
import { FormBankComponent } from 'src/app/components/money/form-bank/form-bank.component';
import { MoneyAccountComponent } from 'src/app/components/money/money-account/money-account.component';
import { FormAccountComponent } from 'src/app/components/money/form-account/form-account.component';
import { MoneyCategoryComponent } from 'src/app/components/money/money-category/money-category.component';
import { FormCategoryComponent } from 'src/app/components/money/form-category/form-category.component';

import { MoneyTransactionsComponent } from 'src/app/components/money/money-transactions/money-transactions.component';

import { SettingsPageComponent } from 'src/app/components/settings-page/settings-page.component';
import { LoginPageComponent } from 'src/app/components/login-page/login-page.component';
import { RegisterPageComponent } from 'src/app/components/register-page/register-page.component';

import { NotificationsComponent } from 'src/app/components/shared/notifications/notifications.component';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthService } from 'src/app/services/auth/auth.service';
import { AuthGuard } from 'src/app/services/auth/auth.guard';
import { NotificationsService } from 'src/app/services/notifications.service';

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
    MoneyCategoryComponent,
    FormCategoryComponent,

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
