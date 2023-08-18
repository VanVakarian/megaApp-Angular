export interface UserLogin {
  email: string
  password: string
}

export interface UserRegister {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
}

export interface RegisterResponse {
  status: 201
  data: null
}
