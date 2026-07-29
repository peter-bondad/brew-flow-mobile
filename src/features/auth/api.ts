import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { LoginCredentials, AuthSession } from './types';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:3000';

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((error as { message?: string }).message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await authFetch<{ user: AuthSession['user'] }>('/api/auth/sign-in/email', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
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
