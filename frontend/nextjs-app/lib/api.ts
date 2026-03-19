import { getApiBaseUrl } from "./env";
import { getToken } from "./auth";

export type ApiError = {
  status: number;
  message: string;
};

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { auth?: boolean },
): Promise<T> {
  const url = new URL(path, getApiBaseUrl());
  const headers = new Headers(options?.headers);

  const wantsAuth = options?.auth ?? false;
  if (wantsAuth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && options?.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const json = (await res.json()) as { message?: string };
      if (json?.message) message = json.message;
    } catch {
      // ignore
    }
    const err: ApiError = { status: res.status, message };
    throw err;
  }

  return (await res.json()) as T;
}

