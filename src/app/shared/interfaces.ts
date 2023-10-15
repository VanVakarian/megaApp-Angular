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

export interface RegisterResponse {
  status: 201;
  data: null;
}

export interface CurrencyServerResponse {
  id: number;
  title: string;
  ticker: string;
  symbol: string;
  symbol_pos: string;
  whitespace: boolean;
}

export interface CurrencyFormData {
  id?: number;
  title: string;
  ticker: string;
  symbol: string;
  symbol_pos: string;
  whitespace: boolean;
}

export interface BanksServerResponse {
  id: number;
  title: string;
}

export interface BankFormData {
  id?: number;
  title: string;
}

export interface AccountsServerResponse {
  id: number;
  title: string;
  currency_id: number;
  bank_id: number;
  invest: boolean;
  kind: string;
}

export interface AccountsFormData {
  id?: number;
  title: string;
  currency_id: number;
  bank_id: number;
  invest: boolean;
  kind: string;
}

export interface Notification {
  id: number;
  message: string;
  bgColour: string;
  textColour: string;
  time: number;
}
