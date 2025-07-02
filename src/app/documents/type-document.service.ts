import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TypeDocumentResponseDTO {
  id: number;
  nomTypeDoc: string;
}

export interface TypeDocumentRequestDTO {
  nomTypeDoc: string;
}

@Injectable({
  providedIn: 'root'
})
export class TypeDocumentService {
  private apiUrl = `http://localhost:8083/api/typedocuments`;

  constructor(private http: HttpClient) { }

  // Créer un nouveau type de document
  createTypeDocument(requestDTO: TypeDocumentRequestDTO): Observable<TypeDocumentResponseDTO> {
    return this.http.post<TypeDocumentResponseDTO>(this.apiUrl, requestDTO);
  }

  // Récupérer tous les types de documents
  getAllTypeDocuments(): Observable<TypeDocumentResponseDTO[]> {
    return this.http.get<TypeDocumentResponseDTO[]>(this.apiUrl);
  }

  // Récupérer un type de document par ID
  getTypeDocumentById(id: number): Observable<TypeDocumentResponseDTO> {
    return this.http.get<TypeDocumentResponseDTO>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour un type de document
  updateTypeDocument(id: number, requestDTO: TypeDocumentRequestDTO): Observable<TypeDocumentResponseDTO> {
    return this.http.put<TypeDocumentResponseDTO>(`${this.apiUrl}/${id}`, requestDTO);
  }

  // Supprimer un type de document
  deleteTypeDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Rechercher des types de documents par nom
  searchTypeDocuments(name: string): Observable<TypeDocumentResponseDTO[]> {
    return this.http.get<TypeDocumentResponseDTO[]>(`${this.apiUrl}/search`, {
      params: { name }
    });
  }
}