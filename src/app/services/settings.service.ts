import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';

import { firstValueFrom, Observable, tap } from 'rxjs';

import { Settings } from 'src/app/shared/interfaces';

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
  private requestInProgress$$: WritableSignal<boolean> = signal(false);
  private settingsLocalStorageKey = 'settings';
  private requestTimeout: any;
  private serverUpdateLimitMs = 500;

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
    const settings = localStorage.getItem(this.settingsLocalStorageKey);
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
    this.requestTimeout = setTimeout(() => this.sendPostRequest(resolve, reject), this.serverUpdateLimitMs);
  }

  private sendPostRequest(resolve: () => void, reject: (error: any) => void): void {
    firstValueFrom(this.postRequest()).then(resolve).catch(reject);
  }

  private postRequest(): Observable<any> {
    this.requestInProgress$$.set(true);
    return this.http.post<HttpResponse<any>>('/api/settings', this.settings$$(), { observe: 'response' }).pipe(
      tap((response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.saveSettingsToLocalStorage(this.settings$$());
        } else {
          throw new Error('Settings saving failed');
        }
        this.requestInProgress$$.set(false);
      }),
    );
  }

  private saveSettingsToLocalStorage(settings: Settings): void {
    localStorage.setItem(this.settingsLocalStorageKey, JSON.stringify(settings));
  }
}
