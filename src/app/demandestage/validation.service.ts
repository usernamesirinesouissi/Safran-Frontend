import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface ValidationWithDemandeDTO {
  validationId: string;
  status: string;
  assignedTo: string;
  assignedRole: string;
  decision: string | null;
  decisionBy: string | null;
  createdAt: string;
  decidedAt: string | null;
  comments: string | null;
  demandeId: number;
  intituleProjet: string;
  descriptionProjet: string;
  risquesProjet: string;
  objectifsProjet: string;
  descriptionLivrables: string;
  effortEstime: string;
  dureeEstime: number;
  nombreStagiaires: number;
  typeStage: string;
  statut: string;
} 
@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private apiUrl = 'http://localhost:8083/api/validations';

  constructor(private http: HttpClient) { }

  getValidationsForUser(userId: string, status: string): Observable<ValidationWithDemandeDTO[]> {
    return this.http.get<ValidationWithDemandeDTO[]>(
      `${this.apiUrl}/users/${userId}`
    );
  }
}
