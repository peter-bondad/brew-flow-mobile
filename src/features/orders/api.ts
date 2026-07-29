import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { OrderListResponse, OrderDetailResponse, OrderStatus } from './types';

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

export function useMyOrders(limit = 20, offset = 0, status?: OrderStatus) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (status) {
    params.set("status", status);
  }

  return useQuery({
    queryKey: ["orders", "me", { limit, offset, status }],
    queryFn: () =>
      authFetch<OrderListResponse>(`/api/orders/me?${params.toString()}`),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => authFetch<OrderDetailResponse>(`/api/orders/me/${id}`),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      items: { productId: string; variantId: string; quantity: number }[];
      paymentMethod: string;
      note?: string;
    }) => {
      return authFetch<OrderDetailResponse>('/api/orders/', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) => {
      return authFetch<OrderDetailResponse>(`/api/orders/me/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return authFetch<OrderDetailResponse>(`/api/orders/me/${id}/cancel`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
