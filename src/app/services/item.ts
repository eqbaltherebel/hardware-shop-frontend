import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item, ItemRequest, PriceHistory } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private apiUrl = 'https://shop-inventory-ddc0.onrender.com/api/items';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
      ? localStorage.getItem('token')
      : null;
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private normalizeArray<T>(response: T[] | { data: T[] } | unknown): T[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
      return (response as any).data;
    }
    return [];
  }

  getAll(): Observable<Item[]> {
    return this.http
      .get<Item[] | { data: Item[] }>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(map(response => this.normalizeArray<Item>(response)));
  }

  getById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  create(item: ItemRequest, photo?: File | null): Observable<Item> {
    const formData = this.buildFormData(item, photo);
    return this.http.post<Item>(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  update(id: number, item: ItemRequest, photo?: File | null): Observable<Item>  {
    const formData = this.buildFormData(item, photo);
    return this.http.put<Item>(`${this.apiUrl}/${id}`, formData, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  deletePhoto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/photo`);
  }

  search(query: string): Observable<Item[]> {
    return this.http
      .get<Item[] | { data: Item[] }>(`${this.apiUrl}/search?query=${query}`, {
        headers: this.getHeaders(),
      })
      .pipe(map(response => this.normalizeArray<Item>(response)));
  }

  getLowStock(threshold = 5): Observable<Item[]> {
    return this.http
      .get<Item[] | { data: Item[] }>(`${this.apiUrl}/low-stock?threshold=${threshold}`, {
        headers: this.getHeaders(),
      })
      .pipe(map(response => this.normalizeArray<Item>(response)));
  }

  getPriceHistory(itemId: number): Observable<PriceHistory[]> {
    return this.http.get<PriceHistory[]>(`https://shop-inventory-ddc0.onrender.com/api/price-history/${itemId}`, {
      headers: this.getHeaders(),
    });
  }

  // ── Helpers ──────────────────────────────────────────────

  private buildFormData(item: ItemRequest, photo?: File | null): FormData {
    const formData = new FormData();

    // Attach item as JSON blob
    formData.append('item',
      new Blob([JSON.stringify(item)], { type: 'application/json' })
    );

    // Attach photo if provided
    if (photo) {
      formData.append('photo', photo, photo.name);
    }

    return formData;
  }
}
