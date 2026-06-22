export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id?: number;
  username?: string;
  fullName?: string;
  name?: string;
  role?: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: AuthUser;
}
