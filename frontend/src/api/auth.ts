// src/api/auth.ts
import api from "./axios";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
}

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", payload);
  return response.data;
};
