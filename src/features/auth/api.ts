import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { LoginCredentials, AuthSession } from './types';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:3000';

async function getStoredCookies(): Promise<string> {
  const stored = await SecureStore.getItemAsync('brewflow_auth_cookies');
  return stored ?? '';
}

async function setStoredCookies(cookies: string): Promise<void> {
  if (cookies) {
    await SecureStore.setItemAsync('brewflow_auth_cookies', cookies);
  } else {
    await SecureStore.deleteItemAsync('brewflow_auth_cookies');
  }
}

function parseSetCookieHeader(setCookieHeader: string): string[] {
  const cookies: string[] = [];
  const parts = setCookieHeader.split(', ');
  for (const part of parts) {
    const [nameValue] = part.split(';');
    if (nameValue) {
      cookies.push(nameValue.trim());
    }
  }
  return cookies;
}

async function updateCookiesFromResponse(response: Response): Promise<void> {
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    const cookies = parseSetCookieHeader(setCookieHeader);
    const existingCookies = await getStoredCookies();
    const cookieMap = new Map<string, string>();

    if (existingCookies) {
      for (const cookie of existingCookies.split('; ')) {
        const [name] = cookie.split('=');
        if (name) {
          cookieMap.set(name, cookie);
        }
      }
    }

    for (const cookie of cookies) {
      const [name] = cookie.split('=');
      if (name) {
        cookieMap.set(name, cookie);
      }
    }

    const updatedCookies = Array.from(cookieMap.values()).join('; ');
    await setStoredCookies(updatedCookies);
  }
}

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookies = await getStoredCookies();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(cookies ? { Cookie: cookies } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  await updateCookiesFromResponse(response);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((error as { message?: string }).message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  let csrfToken: string | undefined;
  try {
    const csrfResponse = await authFetch<{ csrfToken: string }>('/api/auth/csrf');
    csrfToken = csrfResponse.csrfToken;
  } catch {
    // If CSRF endpoint is not available, continue without it
  }

  const response = await authFetch<{ user: AuthSession['user'] }>('/api/auth/sign-in/email', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      ...(csrfToken ? { csrfToken } : {}),
    }),
  });

  await SecureStore.setItemAsync('brewflow_logged_in', 'true');
  return { user: response.user };
}

export async function logout(): Promise<void> {
  try {
    await authFetch('/api/auth/sign-out', { method: 'POST' });
  } catch {
    // ignore
  } finally {
    await SecureStore.deleteItemAsync('brewflow_logged_in');
    await SecureStore.deleteItemAsync('brewflow_auth_cookies');
  }
}

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const isLoggedIn = await SecureStore.getItemAsync('brewflow_logged_in');
      if (!isLoggedIn) return null;

      try {
        const response = await authFetch<{ user: AuthSession['user'] }>('/api/auth/get-session');
        return { user: response.user };
      } catch {
        await SecureStore.deleteItemAsync('brewflow_logged_in');
        await SecureStore.deleteItemAsync('brewflow_auth_cookies');
        return null;
      }
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}
