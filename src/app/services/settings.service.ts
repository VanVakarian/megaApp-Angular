import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';

import { firstValueFrom, Observable, tap } from 'rxjs';

import { Settings } from 'src/app/shared/interfaces';

const SETTINGS_LOCALSTORAGE_KEY = 'settings';
const REQUEST_RATE_LIMIT_MS = 500;

export enum RequestStatus {
  Idle = 'Idle',
  InProgress = 'InProgress',
  Success = 'Success',
  Error = 'Error',
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private defaultSettings: Settings = {
    userName: '',
    darkTheme: false,
    selectedChapterFood: false,
    selectedChapterMoney: false,
    height: null,
  };

  public settings$$: WritableSignal<Settings> = signal(this.defaultSettings);

  public requestInProgress$$: WritableSignal<boolean> = signal(false);
  public heightRequestStatus$$: WritableSignal<RequestStatus> = signal(RequestStatus.Idle);

  private requestTimeout: any;

  constructor(private http: HttpClient) {
    // effect(() => { console.log('settings', this.settings$$()); }); // prettier-ignore
  }

  public initLoadSettings(): Observable<Settings> {
    return this.http.get<Settings>('/api/settings/').pipe(
      tap((response: Settings) => {
        const mergedSettings: Settings = {
          ...this.defaultSettings,
          ...response,
        };
        this.settings$$.set(mergedSettings);
        this.saveSettingsToLocalStorage(mergedSettings);
      }),
    );
  }

  public applyTheme(): void {
    if (this.settings$$().darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  public loadSettingsFromLocalStorage(): Settings | null {
    const settings = localStorage.getItem(SETTINGS_LOCALSTORAGE_KEY);
    return settings ? JSON.parse(settings) : null;
  }

  public saveSettings(): Promise<void> {
    clearTimeout(this.requestTimeout);

    return new Promise<void>((resolve, reject) => {
      if (this.requestInProgress$$()) {
        this.schedulePostRequest(resolve, reject);
      } else {
        this.sendPostRequest(resolve, reject);
      }
    });
  }

  private schedulePostRequest(resolve: () => void, reject: (error: any) => void): void {
    this.requestTimeout = setTimeout(() => this.sendPostRequest(resolve, reject), REQUEST_RATE_LIMIT_MS);
  }

  private sendPostRequest(resolve: () => void, reject: (error: any) => void): void {
    firstValueFrom(this.postRequest()).then(resolve).catch(reject);
  }

  private postRequest(): Observable<any> {
    this.requestInProgress$$.set(true);
    this.heightRequestStatus$$.set(RequestStatus.InProgress);
    return this.http.post<HttpResponse<any>>('/api/settings', this.settings$$(), { observe: 'response' }).pipe(
      tap((response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.saveSettingsToLocalStorage(this.settings$$());
          this.heightRequestStatus$$.set(RequestStatus.Success);
        } else {
          this.heightRequestStatus$$.set(RequestStatus.Error);
          throw new Error('Settings saving failed');
        }
      }),
    );
  }

  private saveSettingsToLocalStorage(settings: Settings): void {
    localStorage.setItem(SETTINGS_LOCALSTORAGE_KEY, JSON.stringify(settings));
  }
}
