import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaleRequest, SaleResponse, ReportResponse } from '../models/sale.model';

@Injectable({ providedIn: 'root' })
export class SaleService {

  private apiUrl = 'https://shop-inventory-ddc0.onrender.com/api/sales';

  constructor(private http: HttpClient) {}

  createSale(request: SaleRequest): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(this.apiUrl, request);
  }

  getAll(): Observable<SaleResponse[]> {
    return this.http.get<SaleResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<SaleResponse> {
    return this.http.get<SaleResponse>(`${this.apiUrl}/${id}`);
  }

  cancelSale(id: number): Observable<SaleResponse> {
    return this.http.put<SaleResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getTodayReport(): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}/report/today`);
  }

  getReport(from: string, to: string): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(
      `${this.apiUrl}/report?from=${from}&to=${to}`);
  }
}