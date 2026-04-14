import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
  id?: number;
  aisle: string;
  rack: string;
  shelf: string;
  notes?: string;
  display?: string;
  itemCount?: number;
}

export interface LocationRequest {
  aisle: string;
  rack: string;
  shelf: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class LocationService {

  private apiUrl = 'http://localhost:8080/api/locations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl);
  }

  getById(id: number): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  create(data: LocationRequest): Observable<Location> {
    return this.http.post<Location>(this.apiUrl, data);
  }

  update(id: number, data: LocationRequest): Observable<Location> {
    return this.http.put<Location>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}