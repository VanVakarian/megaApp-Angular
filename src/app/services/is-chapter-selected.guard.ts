import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SettingsService } from 'src/app/services/settings.service';

export const isChapterSelected: CanActivateFn = (route, state) => {
  const settingsService = inject(SettingsService);
  const router = inject(Router);
  const url = state.url;

  const settings = settingsService.settings$$();
  const localSettings = settingsService.loadSettingsFromLocalStorage();

  if (url.startsWith('/food')
    && (!settings.selectedChapterFood && !localSettings?.selectedChapterFood)) {
    router.navigate(['/settings']);
    return false;
  }

  if (url.startsWith('/money')
    && (!settings.selectedChapterMoney && !localSettings?.selectedChapterMoney)) {
    router.navigate(['/settings']);
    return false;
  }

  return true;
};
