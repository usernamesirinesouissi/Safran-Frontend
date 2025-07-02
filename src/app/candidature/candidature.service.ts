// src/app/candidature/services/candidature.service.ts
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
export interface BackendPresence {
  id: number;
  datePresence: string; // ISO string like "2023-10-27T00:00:00"
  // Add other fields if your backend Presence entity has them
}

export interface PresenceCreationRequestDto {
  candidatId: number;
  presenceDates: string[]; // Array of "YYYY-MM-DD" strings
}

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {

  private baseUrl = 'http://localhost:8083/api/candidature';
  private apiUrl = 'http://localhost:8083/api/candidat';
  private entUrl = 'http://localhost:8083/api/entretien'; // Endpoint de base pour entretien
  private presUrl = 'http://localhost:8083/api/presence';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getAccepte(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/statutaccepte`);
  }
  getImageBase64(imageName: string): Observable<string> {
    return this.http.get(`http://localhost:8083/api/candidat/image/${imageName}`, { responseType: 'text' });
  }

  getCandidatById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getCandidaturesByCandidatId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/candidatures`);
  }

  createCandidatureWithScore(candidatId: number, demandeId: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/postulescore/${candidatId}/${demandeId}`, {}, { headers });
  }

  // Modifié pour utiliser l'endpoint qui crée l'entretien ET sa fiche d'évaluation associée
  createEntretien(entretien: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // Utilise l'endpoint POST /api/entretien (EntretienController)
    // Cet endpoint doit créer l'entretien et sa FicheEval associée comme configuré dans votre backend
    return this.http.post(`${this.entUrl}`, entretien, { headers });
  }

  entretiensForCandidat: any[] = []; // Vous ne devriez pas stocker d'état ici, préférez le recharger

  loadEntretiens(candidatId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.entUrl}/by-candidat/${candidatId}`);
  }
  
  searchCandidats(term: string): Observable<any[]> {
    if (!term || !term.trim()) { 
      return of([]); 
    }
      const params = new HttpParams().set('term', term.trim());
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
  }

  loadPresencesForCandidat(candidatId: number): Observable<BackendPresence[]> {
    if (!candidatId && candidatId !== 0) {

    }
    return this.http.get<BackendPresence[]>(`${this.presUrl}/candidat/${candidatId}`)
      .pipe(
        catchError(this.handleError) 
      );
  }

  savePresences(payload: PresenceCreationRequestDto): Observable<any> { 
    return this.http.post<any>(`${this.presUrl}`, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {

    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {

      errorMessage = `Error: ${error.error.message}`;
    } else {

      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && (error.error.message || error.error.detail || typeof error.error === 'string')) {
        errorMessage = error.error.message || error.error.detail || error.error;
      }
    }
    console.error('PresenceService Error:', error);
    return throwError(() => new Error(errorMessage)); 
  }




  
}

