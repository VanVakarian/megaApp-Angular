import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { AuthComponent } from 'src/app/components/settings/auth/auth.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [AuthComponent, NgIf, MatCardModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  constructor() {}
}
