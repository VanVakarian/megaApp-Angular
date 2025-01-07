import { HttpClient, HttpResponse } from '@angular/common/http';
import { effect, Injectable, signal, WritableSignal } from '@angular/core';

import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';

import { Settings } from 'src/app/shared/interfaces';
import {
  DEFAULT_CACHED_REQUEST_VALIDITY_MS,
  DEFAULT_REQUEST_STATUS_FADE_OUT_TIMER,
  DEFAULT_SETTINGS,
} from '../shared/const';
import { cached } from '../shared/decorators/cached-request.decorator';

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
  public settings$$: WritableSignal<Settings> = signal(this.loadSettingsFromLocalStorage());

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

  public initLoadLocalSettings(): Settings {
    return this.loadSettingsFromLocalStorage();
  }

  public async initLoadSettings(): Promise<Settings> {
    try {
      const response = await this.fetchSettings();
      this.settings$$.set(response);
      this.saveSettingsToLocalStorage(response);
      this.applyTheme(response.darkTheme);

      return response;
    } catch (error) {
      console.error('Falling back to local storage');

      const localSettings = this.loadSettingsFromLocalStorage();
      this.settings$$.set(localSettings);
      this.applyTheme(localSettings.darkTheme);

      return localSettings;
    }
  }

  @cached(DEFAULT_CACHED_REQUEST_VALIDITY_MS)
  private fetchSettings(): Promise<Settings> {
    return firstValueFrom(
      this.http.get<Settings>('/api/settings/').pipe(
        catchError((error) => {
          console.error('Failed to fetch settings:', error);
          throw error;
        }),
      ),
    );
  }

  public applyTheme(isDarkTheme: boolean): void {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  public async saveSelectedChapter(setting: Partial<Settings>): Promise<boolean> {
    return await firstValueFrom(this.putRequest(setting));
  }

  private putRequest(newSetting: Partial<Settings>): Observable<boolean> {
    const settingKey = Object.keys(newSetting)[0] as keyof Settings;
    if (!(settingKey in this.requestStatus)) return of(false);

    const currentTimeout = this.requestStatusTimeouts[settingKey as keyof SettingsRequestStatus];
    if (currentTimeout) clearTimeout(currentTimeout);

    const timeoutKey = settingKey as keyof SettingsRequestStatus;
    this.requestStatus[timeoutKey].set(RequestStatus.InProgress);

    return this.http.put<HttpResponse<any>>('/api/settings/', newSetting, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          const updatedSettings = { ...this.settings$$(), ...newSetting };
          this.settings$$.set(updatedSettings);
          this.saveSettingsToLocalStorage(updatedSettings);
          this.updateRequestStatus(timeoutKey, RequestStatus.Success);
          return true;
        } else {
          this.updateRequestStatus(timeoutKey, RequestStatus.Error);
          return false;
        }
      }),
      catchError(() => {
        this.updateRequestStatus(timeoutKey, RequestStatus.Error);
        return of(false);
      }),
    );
  }

  private updateRequestStatus(settingKey: keyof SettingsRequestStatus, status: RequestStatus): void {
    this.requestStatus[settingKey].set(status);
    this.requestStatusTimeouts[settingKey] = setTimeout(() => {
      this.requestStatus[settingKey].set(RequestStatus.Idle);
    }, DEFAULT_REQUEST_STATUS_FADE_OUT_TIMER);
  }

  private loadSettingsFromLocalStorage(): Settings {
    const settings = localStorage.getItem(SETTINGS_LOCALSTORAGE_KEY);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  }

  private saveSettingsToLocalStorage(settings: Settings): void {
    localStorage.setItem(SETTINGS_LOCALSTORAGE_KEY, JSON.stringify(settings));
  }
}
