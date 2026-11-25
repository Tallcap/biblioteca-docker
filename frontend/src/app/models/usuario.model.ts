export interface Usuario {
  username: string;
  nombreCompleto: string;
  rol: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  username?: string;
  nombreCompleto?: string;
  rol?: string;
}

export interface RegisterRequest {
  nombreCompleto: string;
  username: string;
  password: string;
  confirmPassword?: string;
}
