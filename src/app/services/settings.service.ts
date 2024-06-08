import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, Signal, WritableSignal, effect, signal } from '@angular/core';

import { Observable, tap } from 'rxjs';

import { Settings, SettingsResponse } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public requestInProgress$$: Signal<boolean> = signal(false);
  public settings$$: WritableSignal<Settings> = signal({
    darkTheme: false,
    selectedChapterFood: false,
    selectedChapterMoney: false,
  });

  constructor(private readonly http: HttpClient) {}

  getSettings(): Observable<any> {
    return this.http.get<SettingsResponse>('/api/settings/').pipe(
      tap((response: SettingsResponse) => {
        this.setSettings(response);
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

  setSettings(response: SettingsResponse) {
    this.settings$$.update(() => ({
      darkTheme: response.dark_theme,
      selectedChapterFood: response.selected_chapter_food,
      selectedChapterMoney: response.selected_chapter_money,
    }));
  }
}
