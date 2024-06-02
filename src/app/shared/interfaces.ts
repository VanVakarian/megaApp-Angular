export interface UserCreds {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// MISC ////////////////////////////////////////////////////////////////////////

export interface ServerResponse {
  result: boolean;
  value?: string;
}

// FOOD ////////////////////////////////////////////////////////////////////////

export interface HistoryEntry {
  action: 'init' | 'set' | 'add' | 'subtract';
  value: number;
}

export interface DiaryEntry {
  id: number;
  date: string;
  food_catalogue_id: number;
  food_weight: number;
  history: HistoryEntry[];
}

export interface Diary {
  [date: string]: {
    ['food']: {
      [id: number]: DiaryEntry;
    };
    ['body_weight']: number | null;
    ['target_kcals']: number;
  };
}

export interface FormattedDiaryEntry {
  id: number;
  date: string;
  food_catalogue_id: number;
  food_weight: number;
  history: HistoryEntry[];
  food_name: string;
  food_kcals: number;
  food_percent: string;
  food_kcal_percentage_of_days_norm: number;
}

export interface FormattedDiary {
  [date: string]: {
    ['food']: {
      [id: number]: FormattedDiaryEntry;
    };
    ['body_weight']: number | null;
    ['target_kcals']: number;
    ['days_kcals_eaten']: number;
    ['days_kcals_percent']: number;
  };
}

export interface CatalogueEntry {
  id: number;
  name: string;
  kcals: number;
}

export interface Catalogue {
  [id: string | number]: CatalogueEntry;
}

export interface Coefficients {
  [id: number]: number;
}

export interface BodyWeight {
  body_weight: string;
  date_iso: string;
}

export interface BMI {
  widthFractions: number[];
  bmiKgs: number[];
  pointerShiftsInPxByDate: { [date: string]: number };
}

export interface Stats {
  [id: string]: [number, number, number, number];
}

// MONEY ///////////////////////////////////////////////////////////////////////

export interface Currency {
  id: number;
  title: string;
  ticker: string;
  symbol: string;
  symbol_pos: string;
  whitespace: boolean;
}

export interface Bank {
  id: number;
  title: string;
}

export interface Account {
  id: number;
  title: string;
  bank_id: number;
  currency_id: number;
  invest: boolean;
  kind: string;
}

export interface Category {
  id: number;
  title: string;
  kind: string;
}

export interface Notification {
  id: number;
  message: string;
  bgColour: string;
  textColour: string;
  borderColour: string;
  time: number;
}

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  account_id: number;
  category_id: number;
  kind: string;
  is_gift: boolean;
  notes: string | null;
  twin_transaction_id: number | null;
  target_account_id: number | null;
  target_account_amount: number | null;
}

export interface DateTimeFormatOptions {
  weekday?: 'long' | 'short' | 'narrow';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
}
