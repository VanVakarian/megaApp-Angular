// AUTH ////////////////////////////////////////////////////////////////////////

export interface UserCreds {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// WS //////////////////////////////////////////////////////////////////////////

export type IncomingMessage = {
  [key: string]: string;
};

// MISC ////////////////////////////////////////////////////////////////////////

export interface ServerResponse {
  result: boolean;
}

export interface ServerResponseWithMessage extends ServerResponse {
  message?: string;
}

export interface ServerResponseWithDiaryId extends ServerResponse {
  diaryId: number;
}

export interface ServerResponseWithCatalogueEntry extends ServerResponse {
  id?: number;
  name?: string;
  kcals?: number;
}

// SETTINGS ////////////////////////////////////////////////////////////////////

export type Settings = {
  userName: string;
  isUserAdmin?: boolean;
  darkTheme: boolean;
  selectedChapterFood: boolean;
  selectedChapterMoney: boolean;
};

export type SelectedChapterNames = 'selectedChapterFood' | 'selectedChapterMoney' | '';

export type LocalStorageSettings = Settings | null;

// NAVBARS /////////////////////////////////////////////////////////////////////

// FOOD ////////////////////////////////////////////////////////////////////////

export interface DiaryEntry {
  id: number;
  dateISO: string;
  foodCatalogueId: number;
  foodWeight: number;
  history: HistoryEntry[];
}

export interface DiaryEntryEdit {
  id: number;
  foodWeight: number;
  history: HistoryEntry[];
}

export interface Diary {
  [dateISO: string]: {
    ['food']: {
      [id: number]: DiaryEntry;
    };
    ['bodyWeight']: number | null;
    ['targetKcals']: number;
  };
}

export interface FormattedDiaryEntry {
  id: number;
  dateISO: string;
  foodCatalogueId: number;
  foodWeight: number;
  history: HistoryEntry[];
  foodName: string;
  foodKcals: number;
  foodPercent: string;
  foodKcalPercentageOfDaysNorm: number;
}

export interface HistoryEntry {
  action: 'init' | 'set' | 'add' | 'subtract';
  value: number;
}

export interface FormattedDiary {
  [date: string]: {
    ['food']: {
      [id: number]: FormattedDiaryEntry;
    };
    ['bodyWeight']: number | null;
    ['targetKcals']: number;
    ['kcalsEaten']: number;
    ['kcalsPercent']: number;
  };
}

export type CatalogueId = number;

export type CatalogueIds = CatalogueId[];

export interface CatalogueEntry {
  id: number;
  name: string;
  kcals: number;
}

export interface Catalogue {
  [id: number]: CatalogueEntry;
}

// export interface Coefficients {
//   [id: number]: number;
// }

// export interface BodyWeight {
//   bodyWeight: string;
//   date_iso: string;
// }

// export interface BMI {
//   widthFractions: number[];
//   bmiKgs: number[];
//   pointerShiftsInPxByDate: { [date: string]: number };
// }

// export interface Stats {
//   [id: string]: [number, number, number, number];
// }

// MONEY ///////////////////////////////////////////////////////////////////////

// export interface Currency {
//   id: number;
//   title: string;
//   ticker: string;
//   symbol: string;
//   symbol_pos: string;
//   whitespace: boolean;
// }

// export interface Bank {
//   id: number;
//   title: string;
// }

// export interface Account {
//   id: number;
//   title: string;
//   bank_id: number;
//   currency_id: number;
//   invest: boolean;
//   kind: string;
// }

// export interface Category {
//   id: number;
//   title: string;
//   kind: string;
// }

export interface Notification {
  id: number;
  message: string;
  bgColour: string;
  textColour: string;
  borderColour: string;
  time: number;
}

// export interface Transaction {
//   id: number;
//   date: string;
//   amount: number;
//   account_id: number;
//   category_id: number;
//   kind: string;
//   is_gift: boolean;
//   notes: string | null;
//   twin_transaction_id: number | null;
//   target_account_id: number | null;
//   target_account_amount: number | null;
// }

// export interface DateTimeFormatOptions {
//   weekday?: 'long' | 'short' | 'narrow';
//   month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
//   day?: 'numeric' | '2-digit';
// }
