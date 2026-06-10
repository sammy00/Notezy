export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  success: boolean;
  authToken?: string;
  user?: AuthUser;
  error?: string;
  errors?: { msg?: string }[];
};

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return apiUrl;
};

export const AUTH_TOKEN_KEY = "auth-token";
export const AUTH_USER_KEY = "notezy-user";

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(AUTH_TOKEN_KEY) ?? "";
}

export function getStoredAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? (JSON.parse(user) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(authToken: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, authToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("notezy:auth-changed"));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event("notezy:auth-changed"));
}

async function authRequest(path: string, body: Record<string, string>) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as AuthResponse;

  if (!response.ok || !data.authToken || !data.user) {
    const error =
      data.error ?? data.errors?.[0]?.msg ?? "Authentication failed";
    throw new Error(error);
  }

  saveAuthSession(data.authToken, data.user);
  return data.user;
}

export function loginWithEmail(email: string, password: string) {
  return authRequest("/api/auth/login", { email, password });
}

export function signupWithEmail(name: string, email: string, password: string) {
  return authRequest("/api/auth/signup", { name, email, password });
}
