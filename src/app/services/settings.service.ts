import { HttpClient, HttpResponse } from '@angular/common/http';
import { effect, Injectable, signal, WritableSignal } from '@angular/core';

import { firstValueFrom, Observable, of, tap } from 'rxjs';

import { Settings } from 'src/app/shared/interfaces';
import { DEFAULT_REQUEST_STATUS_FADE_OUT_TIMER } from '../shared/const';

type SettingsRequestStatus = Pick<Settings, 'selectedChapterFood' | 'selectedChapterMoney' | 'darkTheme' | 'height'>;

const SETTINGS_LOCALSTORAGE_KEY = 'settings';

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
    selectedChapterFood: false,
    selectedChapterMoney: false,
    darkTheme: false,
    height: null,
    userName: '',
  };

  public settings$$: WritableSignal<Settings> = signal(this.defaultSettings);

  public requestStatus: Record<keyof SettingsRequestStatus, WritableSignal<RequestStatus>> = {
    selectedChapterFood: signal(RequestStatus.Idle),
    selectedChapterMoney: signal(RequestStatus.Idle),
    darkTheme: signal(RequestStatus.Idle),
    height: signal(RequestStatus.Idle),
  };

  private requestStatusTimeouts: Record<keyof SettingsRequestStatus, ReturnType<typeof setTimeout> | null> = {
    selectedChapterFood: null,
    selectedChapterMoney: null,
    darkTheme: null,
    height: null,
  };

  constructor(private http: HttpClient) {
    effect(() => { console.log('settings', this.settings$$()); }); // prettier-ignore
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

  public applyTheme(isDarkTheme?: boolean): void {
    const valueToApply = isDarkTheme ?? this.settings$$().darkTheme;
    if (valueToApply) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  public loadSettingsFromLocalStorage(): Settings | null {
    const settings = localStorage.getItem(SETTINGS_LOCALSTORAGE_KEY);
    return settings ? JSON.parse(settings) : null;
  }

  public async saveSelectedChapter(setting: Partial<Settings>): Promise<void> {
    return await firstValueFrom(this.putRequest(setting));
  }

  private putRequest(newSetting: Partial<Settings>): Observable<any> {
    const settingKey = Object.keys(newSetting)[0] as keyof Settings;
    if (!(settingKey in this.requestStatus)) return of(null);

    const timeoutKey = settingKey as keyof typeof this.requestStatusTimeouts;
    const currentTimeout = this.requestStatusTimeouts[timeoutKey];
    if (currentTimeout) clearTimeout(currentTimeout);
    this.requestStatus[timeoutKey].set(RequestStatus.InProgress);

    return this.http.put<HttpResponse<any>>('/api/settings/', newSetting, { observe: 'response' }).pipe(
      tap((response: HttpResponse<any>) => {
        if (response.status === 200) {
          const updatedSettings = { ...this.settings$$(), ...newSetting };
          this.settings$$.set(updatedSettings);
          this.saveSettingsToLocalStorage(updatedSettings);

          this.requestStatus[timeoutKey].set(RequestStatus.Success);
          this.requestStatusTimeouts[timeoutKey] = setTimeout(() => {
            this.requestStatus[timeoutKey].set(RequestStatus.Idle);
          }, DEFAULT_REQUEST_STATUS_FADE_OUT_TIMER);
        } else {
          this.requestStatus[timeoutKey].set(RequestStatus.Error);
          this.requestStatusTimeouts[timeoutKey] = setTimeout(() => {
            this.requestStatus[timeoutKey].set(RequestStatus.Idle);
          }, DEFAULT_REQUEST_STATUS_FADE_OUT_TIMER);
          throw new Error('Setting update failed');
        }
      }),
    );
  }

  private saveSettingsToLocalStorage(settings: Settings): void {
    localStorage.setItem(SETTINGS_LOCALSTORAGE_KEY, JSON.stringify(settings));
  }
}
