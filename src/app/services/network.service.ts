import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  constructor(private http: HttpClient) {}

  initPingPong(): void {
    interval(1000)
      .pipe(switchMap(() => this.http.get<{ message: string }>('/api/debug/ping')))
      .subscribe({
        // next: (response) => console.log(response.message),
        error: (error) => console.error('Error:', error),
      });
  }
}
