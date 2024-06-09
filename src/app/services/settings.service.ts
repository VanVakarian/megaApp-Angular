import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

import { Observable, tap } from 'rxjs';

import { LocalStorageSettings, Settings } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private defaultSettings: Settings = {
    darkTheme: false,
    selectedChapterFood: false,
    selectedChapterMoney: false,
  };
  private settingsLocalStorageKey = 'settings';
  private lastServerUpdateTs = 0;
  private updateTimeout: any;
  private serverUpdateLimitMs = 1000;

  public requestInProgress$$: Signal<boolean> = signal(false);
  public settings$$: WritableSignal<Settings> = signal(this.loadSettingsFromLocalStorage() || this.defaultSettings);

  constructor(private readonly http: HttpClient) {
    // effect(() => { console.log('settings', this.settings$$()) }); // prettier-ignore
  }

  getSettings(): Observable<any> {
    return this.http.get<Settings>('/api/settings/').pipe(
      tap((response: Settings) => {
        this.compareLocalAndServerData(response);
      }),
    );
  }

  postSettings(settings: Settings): Observable<any> {
    return this.http.post('/api/settings', settings, { observe: 'response' }).pipe(
      tap((response: HttpResponse<any>) => {
        if (response.status === 200) {
          // console.log('Settings saved successfully');
        } else {
          throw new Error('Settings saving failed');
        }
      }),
    );
  }

  compareLocalAndServerData(serverSettings: Settings) {
    const localSettings: LocalStorageSettings = this.loadSettingsFromLocalStorage();
    if (localSettings === null) {
      this.settings$$.set(serverSettings);
      this.saveSettingsToLocalStorage(serverSettings);
      return;
    }

    const areEqual = Object.keys(localSettings).every(
      (key) => localSettings[key as keyof Settings] === serverSettings[key as keyof Settings],
    );
    if (areEqual) {
      return;
    } else {
      this.postSettings(localSettings).subscribe();
    }
  }

  public saveSettings() {
    this.saveSettingsToLocalStorage(this.settings$$());
    this.scheduleServerUpdate();
  }

  private loadSettingsFromLocalStorage(): Settings {
    const settings = localStorage.getItem(this.settingsLocalStorageKey);
    return settings ? JSON.parse(settings) : null;
  }

  private saveSettingsToLocalStorage(settings: Settings) {
    localStorage.setItem(this.settingsLocalStorageKey, JSON.stringify(settings));
  }

  private scheduleServerUpdate() {
    const timeSinceLastUpdate = Date.now() - this.lastServerUpdateTs;

    if (timeSinceLastUpdate >= this.serverUpdateLimitMs) {
      this.sendSettings();
    } else {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = setTimeout(() => this.sendSettings(), this.serverUpdateLimitMs - timeSinceLastUpdate);
    }
  }

  private sendSettings() {
    this.lastServerUpdateTs = Date.now();
    this.postSettings(this.settings$$()).subscribe();
  }
}
