import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

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

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object  // ← key fix
  ) {}

  // Safe wrapper — only access localStorage in browser
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private setItem(key: string, value: string): void {
    if (this.isBrowser()) localStorage.setItem(key, value);
  }

  private getItem(key: string): string | null {
    return this.isBrowser() ? localStorage.getItem(key) : null;
  }

  private clearStorage(): void {
    if (this.isBrowser()) localStorage.clear();
  }

  login(data: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        this.setItem('token', res.token);
        this.setItem('username', res.username);
        this.setItem('role', res.role);
      })
    );
  }

  register(data: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => {
        this.setItem('token', res.token);
        this.setItem('username', res.username);
        this.setItem('role', res.role);
      })
    );
  }

  logout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getItem('token');   // safe — returns null on server
  }

  getUsername(): string {
    return this.getItem('username') || '';
  }

  getRole(): string {
    return this.getItem('role') || '';
  }
}