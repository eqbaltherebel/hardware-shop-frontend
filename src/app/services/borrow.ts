import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BorrowEntryResponse, BorrowEntryRequest,
  BorrowPaymentRequest, BorrowSummaryResponse,
  LedgerResponse
} from '../models/borrow.model';

@Injectable({ providedIn: 'root' })
export class BorrowService {

  private api = 'https://shop-inventory-ddc0.onrender.com/api/borrow';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BorrowEntryResponse[]> {
    return this.http.get<BorrowEntryResponse[]>(this.api);
  }

  getById(id: number): Observable<BorrowEntryResponse> {
    return this.http.get<BorrowEntryResponse>(`${this.api}/${id}`);
  }

  getByCustomer(cid: number): Observable<BorrowEntryResponse[]> {
    return this.http.get<BorrowEntryResponse[]>(
      `${this.api}/customer/${cid}`);
  }

  search(q: string): Observable<BorrowEntryResponse[]> {
    return this.http.get<BorrowEntryResponse[]>(
      `${this.api}/search?query=${q}`);
  }

  getOverdue(): Observable<BorrowEntryResponse[]> {
    return this.http.get<BorrowEntryResponse[]>(
      `${this.api}/overdue`);
  }

  filterByDate(from: string,
               to: string): Observable<BorrowEntryResponse[]> {
    return this.http.get<BorrowEntryResponse[]>(
      `${this.api}/filter?from=${from}&to=${to}`);
  }

  getSummary(): Observable<BorrowSummaryResponse> {
    return this.http.get<BorrowSummaryResponse>(
      `${this.api}/summary`);
  }

  getLedger(cid: number): Observable<LedgerResponse> {
    return this.http.get<LedgerResponse>(
      `${this.api}/ledger/${cid}`);
  }

  create(req: BorrowEntryRequest): Observable<BorrowEntryResponse> {
    return this.http.post<BorrowEntryResponse>(this.api, req);
  }

  update(id: number,
         req: BorrowEntryRequest): Observable<BorrowEntryResponse> {
    return this.http.put<BorrowEntryResponse>(
      `${this.api}/${id}`, req);
  }

  softDelete(id: number,
             reason: string): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/${id}?reason=${reason}`);
  }

  addPayment(entryId: number,
             req: BorrowPaymentRequest): Observable<BorrowEntryResponse> {
    return this.http.post<BorrowEntryResponse>(
      `${this.api}/${entryId}/payments`, req);
  }

  updatePayment(paymentId: number,
                req: BorrowPaymentRequest): Observable<BorrowEntryResponse> {
    return this.http.put<BorrowEntryResponse>(
      `${this.api}/payments/${paymentId}`, req);
  }

  deletePayment(paymentId: number): Observable<BorrowEntryResponse> {
    return this.http.delete<BorrowEntryResponse>(
      `${this.api}/payments/${paymentId}`);
  }
}