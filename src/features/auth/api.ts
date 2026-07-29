import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { authClient } from "@/lib/auth-client";
import { LoginCredentials, AuthSession } from "./types";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ?? "http://localhost:3000";

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookies = (authClient as any).getCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(cookies ? { Cookie: cookies } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(
      (error as { message?: string }).message || `HTTP ${response.status}`,
    );
  }

  return response.json();
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const response = await (authClient as any).signIn.email({
    email: credentials.email,
    password: credentials.password,
  });

  return { user: (response as any).user as AuthSession["user"] };
}

export async function logout(): Promise<void> {
  try {
    await (authClient as any).signOut();
  } catch {
    // ignore
  }
}

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      try {
        const session = (await (authClient as any).getSession()) as { user?: AuthSession["user"] } | null;
        if (!session?.user) return null;
        return { user: session.user };
      } catch {
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
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}
