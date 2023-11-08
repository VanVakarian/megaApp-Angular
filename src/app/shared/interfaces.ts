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

export interface CategoryFormData {
  id?: number | null;
  title: string;
  kind: string;
  parent_id: number | null;
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
}
