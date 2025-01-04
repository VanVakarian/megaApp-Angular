import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { AuthFormComponent } from 'src/app/components/settings/auth-form/auth-form.component';
import { SettingsFormComponent } from 'src/app/components/settings/settings-form/settings-form.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    SettingsFormComponent,
    AuthFormComponent,
  ],
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent {

  constructor(
    public authService: AuthService,
  ) {
  }

}
