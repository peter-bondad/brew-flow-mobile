export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  isAvailable: boolean;
  displayOrder: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  isAvailable: boolean;
  primaryVariant: ProductVariant | null;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  isAvailable: boolean;
  primaryVariant: ProductVariant | null;
}

export interface ProductListResponse {
  data: ProductListItem[];
  stats: { total: number };
  pagination: { limit: number; offset: number };
}

export interface ProductDetailResponse {
  data: Product;
}

export interface ListProductsParams {
  search?: string;
  category?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
