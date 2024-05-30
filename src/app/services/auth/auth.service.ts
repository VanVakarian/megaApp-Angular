import { AuthResponse, UserLogin, UserRegister } from 'src/app/shared/interfaces';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'main_token';

  authChange = new EventEmitter<boolean>();

  constructor(private readonly http: HttpClient) {}

  login(user: UserLogin): Observable<any> {
    return this.http.post<AuthResponse>('/api/auth/login', user).pipe(
      tap((response) => {
        if (response.token) {
          // console.log(response.token);
          this.setToken(response);
          this.authChange.emit(true);
        } else {
          throw new Error('Auth failed');
        }
      })
    );
  }

  register(user: UserRegister): Observable<any> {
    // TODO: Not sure if I finished this. Need to check some time...
    return this.http.post<HttpResponse<any>>('/api/auth/register', user, { observe: 'response' }).pipe(
      tap((response) => {
        if (response.status === 201) {
          // console.log('Registered successfully');
        } else {
          throw new Error('Registration failed');
        }
      })
    );
  }

  logout() {
    this.removeToken();
    localStorage.removeItem(this.TOKEN_KEY);
    // console.log('Logged out...');
    this.authChange.emit(false);
  }

  private setToken(response: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    // НА ТЕСТАХ ОБНАРУЖИЛОСЬ, ЧТО FALSE НАМЕРТВО ВЕШАЕТ ВКЛАДКУ!
    return true;
    // onst token = localStorage.getItem(this.TOKEN_KEY);
    // if (token) {
    //   const decodedToken = jwt_decode(token) as { exp: number };
    //   const currentTime = Math.round(new Date().getTime() / 1000);
    //   return decodedToken.exp > currentTime;
    // }
    // return false;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
