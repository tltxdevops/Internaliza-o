const STATE_KEY = "internalizacao_oauth_state";
const TOKEN_KEY = "internalizacao_token";
const USER_KEY = "internalizacao_user";

export type AuthUser = {
  sub: string;
  email: string;
  nome: string;
  cargo: string;
  departamento: string;
  photo?: string | null;
};

function randomState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearLocalSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(STATE_KEY);
}

export async function startMicrosoftLogin() {
  const state = randomState();
  sessionStorage.setItem(STATE_KEY, state);
  const response = await fetch(
    `/auth/microsoft/login?state=${encodeURIComponent(state)}`,
    { credentials: "include" },
  );
  if (!response.ok) {
    throw new Error("Não foi possível iniciar o login Microsoft.");
  }
  const data = (await response.json()) as { authUrl?: string };
  if (!data.authUrl) {
    throw new Error("A Microsoft não devolveu a URL de login.");
  }
  window.location.assign(data.authUrl);
}

export async function completeMicrosoftLogin(code: string, state: string) {
  const saved = sessionStorage.getItem(STATE_KEY);
  if (!saved || saved !== state) {
    throw new Error("state");
  }
  sessionStorage.removeItem(STATE_KEY);
  const response = await fetch("/auth/microsoft/callback", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) {
    throw new Error("callback");
  }
  const data = (await response.json()) as {
    user: AuthUser;
    session: { token: string };
  };
  localStorage.setItem(TOKEN_KEY, data.session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function logout() {
  const token = readStoredToken();
  clearLocalSession();
  await fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  window.location.assign("/login");
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = readStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
  if (response.status === 401) {
    clearLocalSession();
    window.location.assign("/login");
  }
  return response;
}

export async function restoreSession() {
  const response = await authFetch("/auth/me");
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as { user: AuthUser };
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}
