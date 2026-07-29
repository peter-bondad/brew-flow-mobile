import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { ProductListResponse, ProductDetailResponse, ListProductsParams } from './types';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:3000';

async function fetchProducts(params: ListProductsParams) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.category) searchParams.set('category', params.category);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  searchParams.set('limit', String(params.limit ?? 20));
  searchParams.set('offset', String(params.offset ?? 0));

  const response = await fetch(`${API_BASE_URL}/api/products?${searchParams.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json() as Promise<ProductListResponse>;
}

async function fetchProduct(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(id)}`, {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json() as Promise<ProductDetailResponse>;
}

export function useProducts(params: ListProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
}
