import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from 'src/app/services/auth.service';
import { SettingsFormComponent } from 'src/app/components/settings/settings-form/settings-form.component';
import { AuthFormComponent } from 'src/app/components/settings/auth-form/auth-form.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [NgIf, MatCardModule, AuthFormComponent, SettingsFormComponent],
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent {
  constructor(public authService: AuthService) {}
}
