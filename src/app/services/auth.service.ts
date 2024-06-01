import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';

import { AuthResponse, UserCreds } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'main_token';
  private authenticationStatus$$ = signal<boolean>(false);

  constructor(private readonly http: HttpClient) {}

  get checkIfAuthenticated() {
    return this.authenticationStatus$$();
  }

  login(user: UserCreds): Observable<any> {
    return this.http.post<AuthResponse>('/api/auth/login', user, { observe: 'response' }).pipe(
      tap((response: HttpResponse<AuthResponse>) => {
        if (response.body?.token) {
          this.setToken(response.body);
          this.authenticationStatus$$.set(true);
        } else {
          // TODO: Make an error message
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
    this.removeToken();
    this.authenticationStatus$$.set(false);
  }

  private setToken(response: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  public initCheckToken(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      const decodedToken = jwt_decode(token) as { exp: number };
      const currentTime = Math.round(new Date().getTime() / 1000);
      this.authenticationStatus$$.set(decodedToken.exp > currentTime);
    } else {
      this.authenticationStatus$$.set(false);
    }
  }
}
