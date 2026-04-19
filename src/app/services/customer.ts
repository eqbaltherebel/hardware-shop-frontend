import { Injectable, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CustomerRequest } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {

  private apiUrl = 'http://localhost:8080/api/customers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  search(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(
      `${this.apiUrl}/search?query=${query}`);
  }

  getSalesHistory(id: number): Observable<Customer> {
    return this.http.get<Customer>(
      `${this.apiUrl}/${id}/sales`);
  }

  create(data: CustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, data);
  }

  update(id: number, data: CustomerRequest): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}