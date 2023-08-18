import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, RegisterResponse, UserLogin, UserRegister } from 'src/app/shared/interfaces';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'megaapp_token';

  authChange = new EventEmitter<boolean>();

  constructor(
    private readonly http: HttpClient,
  ) { }

  login(user: UserLogin): Observable<any> {
    // console.log('Sending login request...')
    return this.http.post<AuthResponse>('/api/auth/login', user)
      .pipe(
        tap(response => {
          if (response.token) {
            console.log(response.token)
            this.setToken(response)
            this.authChange.emit(true);
          } else {
            throw new Error('Auth failed')
          }
        }),
      )
  }

  register(user: UserRegister): Observable<any> {
    // console.log('Sending registration request...')
    return this.http.post<HttpResponse<any>>('/api/auth/register', user, { observe: 'response' })
      .pipe(
        tap(response => {
          if (response.status === 201) {
            console.log('Registered successfully')
          } else {
            throw new Error('Registration failed')
          }
        }),
      )
  }

  logout() {
    this.setToken(null)
    console.log('Logged out...')
    this.authChange.emit(false);
  }

  private setToken(response: AuthResponse | null) {
    if (response) {
      localStorage.setItem(this.TOKEN_KEY, response.token)
    } else {
      localStorage.clear()
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token
  }
}
