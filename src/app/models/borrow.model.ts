export interface BorrowPaymentResponse {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
  deleted: boolean;
  createdAt: string;
}

export interface BorrowEntryResponse {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  borrowDate: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  tags?: string;
  creditLimit?: number;
  status: string;
  overdue: boolean;
  deleted: boolean;
  payments: BorrowPaymentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface BorrowEntryRequest {
  customerId: number;
  totalAmount: number;
  borrowDate: string;
  dueDate?: string | null;
  description?: string;
  notes?: string;
  tags?: string;
  creditLimit?: number;
}

export interface BorrowPaymentRequest {
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  notes?: string;
}

export interface CustomerCreditSummary {
  customerId: number;
  customerName: string;
  customerPhone?: string;
  totalBorrowed: number;
  totalPaid: number;
  outstanding: number;
  creditLimit?: number;
  creditLimitExceeded: boolean;
  status: string;
}

export interface BorrowSummaryResponse {
  totalCreditGiven: number;
  totalCollected: number;
  totalOutstanding: number;
  totalEntries: number;
  pendingEntries: number;
  overdueEntries: number;
  clearedEntries: number;
  customerSummaries: CustomerCreditSummary[];
}

export interface LedgerEntry {
  date: string;
  type: string;
  description?: string;
  amount: number;
  paid: number;
  balance: number;
  notes?: string;
  referenceId: number;
}

export interface LedgerResponse {
  customerId: number;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  totalBorrowed: number;
  totalPaid: number;
  outstanding: number;
  entries: LedgerEntry[];
}