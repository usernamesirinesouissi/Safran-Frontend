import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8083/api/auth/'; // URL directe

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}signin`, { 
      username, 
      password 
    });
  }

  register(username: string, email: string, password: string,roles: string[]): Observable<any> {
    return this.http.post(
      `${this.apiUrl}signup`, 
      { username, email, password,    role: roles },
      { observe: 'response' } // Pour voir la réponse complète
    );
  }}