import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemRequest, PriceHistory } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private apiUrl = 'http://localhost:8080/api/items';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  create(item: ItemRequest): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item, { headers: this.getHeaders() });
  }

  update(id: number, item: ItemRequest): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, item, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  search(query: string): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/search?query=${query}`, {
      headers: this.getHeaders(),
    });
  }

  getLowStock(threshold = 5): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/low-stock?threshold=${threshold}`, {
      headers: this.getHeaders(),
    });
  }

  // Add inside ItemService class:
  getPriceHistory(itemId: number): Observable<PriceHistory[]> {
    return this.http.get<PriceHistory[]>(`http://localhost:8080/api/price-history/${itemId}`);
  }
}
