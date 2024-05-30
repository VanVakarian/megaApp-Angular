import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent {
  constructor(private router: Router, public auth: AuthService) {
    auth.authChange.subscribe((isAuthed) => {
      this.isAuthenticated = isAuthed;
    });
  }

  isAuthenticated = this.auth.isAuthenticated();

  logout(event: Event) {
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
