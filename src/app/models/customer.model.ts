import { SaleResponse } from './sale.model';

export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  totalPurchases?: number;
  totalSpent?: number;
  totalProfit?: number;
  lastPurchase?: string;
  createdAt?: string;
  sales?: SaleResponse[];
}

export interface CustomerRequest {
  name: string;
  phone?: string;
  address?: string;
  email?: string;
}