import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(
    private router: Router,
    public auth: AuthService,
  ) {
    auth.authChange.subscribe(isAuthed => {
      this.isAuthenticated = isAuthed;
    });
  }

  buttons = [
    { label: 'Kcals', link: '/kcals', active: true, requiresAuth: true },
    { label: 'Money', link: '/money', active: true, requiresAuth: true },
    { label: 'Settings', link: '/settings', active: true, requiresAuth: true },
    { label: 'Log in', link: '/login', active: true },
    { label: 'Register', link: '/register', active: true },
  ];

  isAuthenticated = this.auth.isAuthenticated();

  logout(event: Event) {
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}