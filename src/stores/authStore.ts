import { create } from "zustand";
import type { AuthUser } from "@/types/auth";

const TOKEN_KEY = "gamezone-auth-token";
const USER_KEY = "gamezone-auth-user";

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  setAuth: (token: string, user?: AuthUser | null) => void;
  logout: () => void;
  hydrate: () => void;
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function persistAuth(token: string, user: AuthUser | null) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_KEY);
  }
}

function clearPersistedAuth() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isHydrated: false,
  setAuth: (token, user = null) => {
    persistAuth(token, user);
    set({ token, user });
  },
  logout: () => {
    clearPersistedAuth();
    set({ token: null, user: null });
  },
  hydrate: () => {
    if (typeof window === "undefined") {
      set({ isHydrated: true });
      return;
    }

    set({
      token: window.localStorage.getItem(TOKEN_KEY),
      user: readStoredUser(),
      isHydrated: true,
    });
  },
}));
