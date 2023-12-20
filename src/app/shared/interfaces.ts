export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

// FOOD //

export interface DiaryEntry {
  id: number;
  date: string;
  catalogue_id: number;
  food_weight: number;
}

export interface Diary {
  [date: string]: {
    ['food']: {
      [id: number]: DiaryEntry;
    };
    ['weight']: number;
    ['target_kcals']: number;
  };
}

export interface FormattedDiaryEntry {
  id: number;
  date: string;
  catalogue_id: number;
  food_weight: number;
  formatted_food_name: string;
  formatted_weight: string;
  formatted_kcals: string;
  formatted_percent: string;
  fraction: number;
}

export interface FormattedDiary {
  [date: string]: {
    ['food']: {
      [id: number]: FormattedDiaryEntry;
    };
    ['weight']: number;
    ['target_kcals']: number;
  };
}

interface CatalogueEntry {
  id: number;
  name: string;
  kcals: number;
}

export interface Catalogue {
  [id: number]: CatalogueEntry;
}

export interface Coefficients {
  [id: number]: number;
}

export interface Stats {
  [id: string]: [number, number, number, number];
}

// MONEY //

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
