export interface SaleItemRequest {
  itemId: number;
  quantity: number;
}

export interface SaleRequest {
  customerName?: string;
  customerPhone?: string;
  items: SaleItemRequest[];
  paymentMethod: string;
  notes?: string;
}

export interface SaleItemResponse {
  id: number;
  itemId: number;
  itemName: string;
  itemPhotoUrl?: string;
  quantitySold: number;
  priceAtSale: number;
  costAtSale: number;
  subtotal: number;
  profit: number;
}

export interface SaleResponse {
  id: number;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  totalCost: number;
  profit: number;
  paymentMethod: string;
  notes?: string;
  status: string;
  soldBy: string;
  saleDate: string;
  saleItems: SaleItemResponse[];
}

export interface TopItem {
  itemId: number;
  itemName: string;
  itemPhotoUrl?: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface ReportResponse {
  fromDate: string;
  toDate: string;
  totalSales: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  revenueByDay: { [date: string]: number };
  profitByDay:  { [date: string]: number };
  salesByDay:   { [date: string]: number };
  revenueByPayment: { [method: string]: number };
  topItems?: TopItem[];
  sales: SaleResponse[];
}