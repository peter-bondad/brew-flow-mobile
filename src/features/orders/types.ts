export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  paymentMethod: string;
  subtotal: number;
  total: number;
  itemCount: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderListItem {
  id: string;
  status: OrderStatus;
  paymentMethod: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderListResponse {
  data: OrderListItem[];
  stats: { total: number };
  pagination: { limit: number; offset: number };
}

export interface OrderDetailResponse {
  data: Order;
}
