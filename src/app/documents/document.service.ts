import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DocumentResponseDTO } from './document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  // URLs de base
  private documentsApiUrl = `http://localhost:8083/api/documents`;
  private candidatureApiUrl = `http://localhost:8083/api/candidature`;


  /*  private apiUrl = 'http://localhost:8083/api/demandes';
  private baseUrl = 'http://localhost:8083/api/workflows'; */

  constructor(private http: HttpClient) { }

  // Récupérer tous les documents
  getAllDocuments(): Observable<DocumentResponseDTO[]> {
    return this.http.get<DocumentResponseDTO[]>(this.documentsApiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Télécharger un document
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.documentsApiUrl}/${id}/download`, { 
      responseType: 'blob',
      observe: 'body'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Supprimer un document
  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.documentsApiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Téléverser des documents pour une candidature
  uploadCandidatureDocuments(
    candidatureId: number, 
    files: File[], 
    typeIds: number[]
  ): Observable<DocumentResponseDTO[]> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file, file.name);
      formData.append('typeIds', typeIds[index].toString());
    });

    return this.http.post<DocumentResponseDTO[]>(
      `${this.candidatureApiUrl}/${candidatureId}/documents`, 
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Modifier uniquement le type d'un document
  updateDocumentType(id: number, newTypeId: number): Observable<DocumentResponseDTO> {
    const params = new HttpParams().set('newTypeId', newTypeId.toString());
    
    return this.http.put<DocumentResponseDTO>(
      `${this.documentsApiUrl}/${id}/type`, 
      null, // Pas de body pour cette requête
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Remplacer uniquement le fichier d'un document
  replaceDocumentFile(id: number, newFile: File): Observable<DocumentResponseDTO> {
    const formData = new FormData();
    formData.append('file', newFile, newFile.name);
    
    return this.http.put<DocumentResponseDTO>(
      `${this.documentsApiUrl}/${id}/file`, 
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Mettre à jour complète d'un document (fichier et/ou type)
  updateDocument(
    id: number, 
    newFile?: File, 
    newTypeId?: number
  ): Observable<DocumentResponseDTO> {
    const formData = new FormData();
    
    if (newFile) {
      formData.append('file', newFile, newFile.name);
    }
    
    if (newTypeId) {
      formData.append('newTypeId', newTypeId.toString());
    }
    
    return this.http.put<DocumentResponseDTO>(
      `${this.documentsApiUrl}/${id}`, 
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Gestion centralisée des erreurs
  private handleError(error: any) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
      
      // Messages spécifiques basés sur le code d'erreur
      switch (error.status) {
        case 400:
          errorMessage = 'Requête incorrecte: ' + (error.error?.message || 'Paramètres invalides');
          break;
        case 404:
          errorMessage = 'Document non trouvé';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur';
          break;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}