import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { responseType: 'text' })
      .pipe(
        tap(() => {
          // Salva o estado de autenticado no localStorage
          localStorage.setItem('isAuthenticated', 'true');
        })
      );
  }

  logout(): void {
    localStorage.removeItem('isAuthenticated');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
}
