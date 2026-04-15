import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  private getStorage(): Storage | null {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
      ? localStorage
      : null;
  }

  login(data: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        const storage = this.getStorage();
        storage?.setItem('token', res.token);
        storage?.setItem('username', res.username);
        storage?.setItem('role', res.role);
      })
    );
  }

  register(data: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => {
        const storage = this.getStorage();
        storage?.setItem('token', res.token);
        storage?.setItem('username', res.username);
        storage?.setItem('role', res.role);
      })
    );
  }

  logout(): void {
    this.getStorage()?.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getStorage()?.getItem('token');
  }

  getUsername(): string {
    return this.getStorage()?.getItem('username') || '';
  }

  getRole(): string {
    return this.getStorage()?.getItem('role') || '';
  }
}