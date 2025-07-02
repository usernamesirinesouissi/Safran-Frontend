// src/app/evaluation-mi-parcours/evaluation-mi-parcours.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompetenceComportementale } from 'src/app/demandestage/demande.model';
import { NiveauEvaluation, EvaluationStageCreateDTO, EvaluationStage, FicheEvalDetailResponseDTO } from 'src/app/_api/_models/evaluation.model';


@Injectable({
  providedIn: 'root'
})
export class EvaluationParcoursService {
  private apiUrl = 'http://localhost:8083/api'; 

  public readonly STATUT_GLOBAL_RETENU_LIBELLE = "Retenu Rh et Technique";

  constructor(private http: HttpClient) { }

  getCompetencesComportementales(): Observable<CompetenceComportementale[]> {
    return this.http.get<CompetenceComportementale[]>(`${this.apiUrl}/competences`);
  }

  getNiveauxEvaluation(): Observable<NiveauEvaluation[]> {
    return this.http.get<NiveauEvaluation[]>(`${this.apiUrl}/niveaux-evaluation`);
  }

  createEvaluationStage(payload: EvaluationStageCreateDTO): Observable<EvaluationStage> {
    return this.http.post<EvaluationStage>(`${this.apiUrl}/evaluations-stage`, payload);
  }

 
  getFicheEvalById(ficheEvalId: number): Observable<FicheEvalDetailResponseDTO> {
 
    return this.http.get<FicheEvalDetailResponseDTO>(`${this.apiUrl}/fiche-eval/${ficheEvalId}`);
  }

  
  getCandidatById(candidatId: number): Observable<any> { 
    return this.http.get<any>(`${this.apiUrl}/candidats/${candidatId}`); 
  }
}