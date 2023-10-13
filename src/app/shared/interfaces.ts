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
  name: string;
  ticker: string;
  symbol: string;
  symbol_pos: string;
  whitespace: boolean;
  users_id: number;
}

export interface CurrencyFormData {
  id?: any;
  name: string;
  ticker: string;
  symbol: string;
  symbol_pos: string;
  whitespace: boolean;
}

export interface BanksServerResponse {
  id: number;
  name: string;
  users_id: number;
}

export interface BankFormData {
  id?: any;
  name: string;
}
