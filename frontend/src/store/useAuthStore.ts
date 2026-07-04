// src/store/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

export const ROLES = {
  admin: "ADMIN",
  user: "USER",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export interface AuthUser {
  id: string;
  userName: string;
  role: UserRole;
}

// shape of the payload the backend signs into the access token
interface TokenPayload {
  userId: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuthFromToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuthFromToken: (token) => {
        const payload = jwtDecode<TokenPayload>(token);
        set({
          token,
          user: {
            id: payload.userId,
            userName: payload.name,
            role: payload.role,
          },
        });
      },
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
);

// Direct getter function, safe to call outside react (and during SSR)
export const getAuthToken = () => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("auth-storage");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
};
