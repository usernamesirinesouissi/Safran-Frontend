import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ParametragesService {
  private apiUrls: { [key: string]: string } = {
    'Compétences RH': 'http://localhost:8083/api/competences',
    'Compétences Technique': 'http://localhost:8083/api/competencetechniques',
    'Ecole': 'http://localhost:8083/api/ecoles',
    'Unité Opérationnel': 'http://localhost:8083/api/uo',
    'Formation Académique': 'http://localhost:8083/api/formations-academiques',
    'Type Stage': 'http://localhost:8083/api/type-stages',
    'Statut': 'http://localhost:8083/api/statuts',
     'Niveau Evaluation': 'http://localhost:8083/api/niveaux-evaluation',
    'NewParams': 'http://localhost:8083/api/parametrages/ajouter',
    'SubParametrages': 'http://localhost:8083/api/subparametrages',  // Nouvelle URL
    'Parametrages': 'http://localhost:8083/api/parametrages',        // Nouvelle URL
  };
  constructor(private http: HttpClient) {}

  private getApiUrl(tab: any): string {
    console.log("Valeur de 'tab':", tab, "Type:", typeof tab);

    if (typeof tab === "object" && tab !== null) {
        if ("name" in tab) {
            tab = tab.name;  
        } else {
            console.error("L'objet tab ne contient pas de clé 'name'");
            return '';
        }
    }

    const apiUrl = this.apiUrls[tab];
    if (!apiUrl) {
        console.error(`URL d'API non trouvée pour l'onglet: ${tab}`);
        return '';
    }

    return apiUrl;
  }

  private getAuthHeaders(): HttpHeaders {
    // Récupérer le token JWT depuis le stockage local
    const token = localStorage.getItem('auth_token'); // ou 'access_token' selon votre implémentation
    
    if (!token) {
      console.error('Aucun token JWT trouvé');
      return new HttpHeaders();
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllParameters(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrls['Parametrages'], { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getData(tab: string): Observable<any[]> {
    const url = this.getApiUrl(tab);
    if (!url) return throwError(() => new Error('URL non trouvée'));

    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() }).pipe(
      tap(data => console.log(`Données reçues pour ${tab}:`, data)),
      catchError(this.handleError)
    );
  }

  addData(tab: string, item: any): Observable<any> {
    const url = this.getApiUrl(tab);
    if (!url) return throwError(() => new Error('URL non trouvée'));
    
    console.log(`Envoi POST à ${url} avec données:`, item);
    return this.http.post<any>(url, item, { headers: this.getAuthHeaders() }).pipe(
      tap(response => {
        console.log('Réponse d\'ajout:', response);
      }),
      catchError(this.handleError)
    );
  }

  updateData(tab: string, id: number, item: any): Observable<any> {
    const url = this.getApiUrl(tab);
    if (!url) return throwError(() => new Error('URL non trouvée'));

    console.log(`Envoi PUT à ${url}/${id} avec données:`, item);
    return this.http.put<any>(`${url}/${id}`, item, { headers: this.getAuthHeaders() }).pipe(
      tap(response => console.log(`Réponse de mise à jour pour ${tab}:`, response)),
      catchError(this.handleError)
    );
  }

  deleteData(tab: string, id: number): Observable<void> {
    const url = this.getApiUrl(tab);
    if (!url) return throwError(() => new Error('URL non trouvée'));

    console.log(`Envoi DELETE à ${url}/${id}`);
    return this.http.delete<void>(`${url}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => console.log(`Suppression réussie pour id=${id}`)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur HTTP:', error);

    if (error.status === 401) {
      // Rediriger vers la page de login si non authentifié
      console.error('Authentification requise');
      // window.location.href = '/login'; // Décommenter si nécessaire
    } else if (error.error instanceof ErrorEvent) {
      console.error('Erreur client:', error.error.message);
    } else {
      console.error(
        `Code d'erreur ${error.status}, ` +
        `Corps: ${JSON.stringify(error.error)}`
      );
    }

    return throwError(() => new Error('Une erreur est survenue'));
  }
}