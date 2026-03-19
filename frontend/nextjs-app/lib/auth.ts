export type AuthUser = {
  id: number;
  email: string;
  role: string;
  hotelId?: number | null;
};

const TOKEN_KEY = "altairis.token";
const USER_KEY = "altairis.user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);

  // For middleware-protected navigation; not HttpOnly (MVP).
  if (!token) {
    document.cookie = "altairis.token=; Path=/; Max-Age=0";
  } else {
    document.cookie = `altairis.token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) localStorage.removeItem(USER_KEY);
  else localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function signOut() {
  setToken(null);
  setUser(null);
}

