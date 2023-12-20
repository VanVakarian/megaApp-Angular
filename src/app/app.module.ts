import { MainAppComponent } from 'src/app/app.component';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { ModalYNComponent } from 'src/app/components/shared-components/modal-y-n/modal-y-n.component';
import { MatDialogModal } from 'src/app/components/shared-components/mat-dialog-modal/mat-dialog-modal.component';

import { KcalFoodComponent } from 'src/app/components/kcal/food/kcal-food.component';

import { MoneyDashboardComponent } from 'src/app/components/money/money-dashboard/money-dashboard.component';
import { MoneyManageComponent } from 'src/app/components/money/money-manage/money-manage.component';
import { MoneyCurrencyComponent } from 'src/app/components/money/money-currency/money-currency.component';
import { CurrencyFormComponent } from 'src/app/components/money/money-currency/currency-form/currency-form.component';
import { MoneyBankComponent } from 'src/app/components/money/money-bank/money-bank.component';
import { BankFormComponent } from 'src/app/components/money/money-bank/bank-form/bank-form.component';
import { MoneyAccountComponent } from 'src/app/components/money/money-account/money-account.component';
import { AccountFormComponent } from 'src/app/components/money/money-account/account-form/account-form.component';
import { MoneyCategoryComponent } from './components/money/money-category/money-category.component';
import { CategoryFormComponent } from 'src/app/components/money/money-category/category-form/category-form.component';

import { MoneyTransactionsComponent } from 'src/app/components/money/money-transactions/money-transactions.component';
import { TransactionExpenseIncomeForm } from 'src/app/components/money/money-transactions/transaction-forms/transaction-expense-income-form.component';
import { TransactionTransferForm } from './components/money/money-transactions/transaction-forms/transaction-transfer-form.component';

import { SettingsPageComponent } from 'src/app/components/settings-page/settings-page.component';
import { LoginPageComponent } from 'src/app/components/login-page/login-page.component';
import { RegisterPageComponent } from 'src/app/components/register-page/register-page.component';

import { NotificationsComponent } from 'src/app/components/shared-components/notifications/notifications.component';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/shared/material.module';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
    MainAppComponent,
    NavbarComponent,
    ModalYNComponent,
    MatDialogModal,

    KcalFoodComponent,

    MoneyDashboardComponent,
    MoneyManageComponent,
    MoneyCurrencyComponent,
    CurrencyFormComponent,
    MoneyBankComponent,
    BankFormComponent,
    MoneyAccountComponent,
    AccountFormComponent,
    MoneyCategoryComponent,
    CategoryFormComponent,

    MoneyTransactionsComponent,
    TransactionExpenseIncomeForm,
    TransactionTransferForm,

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
    MaterialModule,
    MatNativeDateModule,
  ],
  providers: [],
  bootstrap: [MainAppComponent],
})
export class AppModule {}
