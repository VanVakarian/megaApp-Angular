import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';

import { AuthResponse, UserCreds } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private authenticationStatus$$ = signal<boolean>(false);

  constructor(
    private readonly http: HttpClient,
    private router: Router,
  ) {}

  get checkIfAuthenticated() {
    return this.authenticationStatus$$();
  }

  login(user: UserCreds): Observable<any> {
    return this.http.post<AuthResponse>('/api/auth/login', user, { observe: 'response' }).pipe(
      tap((response: HttpResponse<AuthResponse>) => {
        if (response.body?.accessToken && response.body?.refreshToken) {
          this.setTokens(response.body);
          this.authenticationStatus$$.set(true);
        } else {
          throw new Error('Auth failed');
        }
      }),
    );
  }

  register(user: UserCreds): Observable<any> {
    return this.http.post('/api/auth/register', user, { observe: 'response' }).pipe(
      tap((response: HttpResponse<any>) => {
        if (response.status === 201) {
          console.log('Registration completed successfully');
        } else {
          throw new Error('Registration failed');
        }
      }),
    );
  }

  logout() {
    this.removeTokens();
    this.authenticationStatus$$.set(false);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return this.http.post<AuthResponse>('/api/auth/refresh', { refreshToken }).pipe(
      tap((response: AuthResponse) => {
        if (response.accessToken && response.refreshToken) {
          this.setTokens(response);
        }
      }),
      catchError(() => {
        this.logout();
        throw new Error('Refresh token expired or invalid');
      }),
    );
  }

  private setTokens(response: AuthResponse) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
  }

  private removeTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  public initCheckToken(): void {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (token) {
      const decodedToken = jwt_decode(token) as { exp: number };
      const currentTime = Math.round(new Date().getTime() / 1000);
      if (decodedToken.exp > currentTime) {
        this.authenticationStatus$$.set(true);
      } else {
        this.refreshToken().subscribe({
          next: () => {
            this.authenticationStatus$$.set(true);
            this.router.navigate(['']);
          },
          error: () => {
            this.authenticationStatus$$.set(false);
          },
        });
      }
    } else {
      this.authenticationStatus$$.set(false);
    }
  }
}

export const tokenGetter = () => localStorage.getItem('access_token');
