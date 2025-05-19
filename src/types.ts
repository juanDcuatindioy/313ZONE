// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sale Types
export interface SaleItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  NEQUI = 'NEQUI'
}

export interface Sale {
  id: number;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  date: string;
}

// Analytics Types
export interface SalesByDay {
  date: string;
  total: number;
  count: number;
}

export interface SalesByCategory {
  category: string;
  total: number;
  count: number;
}

export interface SalesByPaymentMethod {
  paymentMethod: PaymentMethod;
  total: number;
  count: number;
}