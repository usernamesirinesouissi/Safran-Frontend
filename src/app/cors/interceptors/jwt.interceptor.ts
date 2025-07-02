import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Récupère le token JWT depuis le localStorage
    const token = localStorage.getItem('auth_token');

    // Si le token existe, clone la requête et ajoute le header Authorization
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Passe la requête au prochain handler et gère les erreurs
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Accès non autorisé - Redirection vers la page de login');
          // window.location.href = '/login'; // Décommentez pour rediriger
        }
        return throwError(() => error);
      })
    );
  }
}