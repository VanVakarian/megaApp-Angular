import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MainAppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { KcalsPageComponent } from './components/kcals-page/kcals-page.component';
import { MoneyPageComponent } from './components/money-page/money-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';

import { AuthGuard } from './services/auth/auth.guard';
import { AuthService } from './services/auth/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { RegisterPageComponent } from './components/register-page/register-page.component';

@NgModule({
  declarations: [
    MainAppComponent,
    NavbarComponent,
    KcalsPageComponent,
    MoneyPageComponent,
    SettingsPageComponent,
    LoginPageComponent,
    RegisterPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  // providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy, },],
  bootstrap: [MainAppComponent],
  providers: [AuthService, AuthGuard]
})
export class AppModule { }
