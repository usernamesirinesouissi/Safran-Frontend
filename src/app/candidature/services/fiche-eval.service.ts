// src/app/candidature/services/fiche-eval.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CompetenceScoreDTO {
  competenceId: number;
  score: number;
}

export interface ExigenceScoreDTO {
  exigenceId: number;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class FicheEvalService {
  private apiUrl = 'http://localhost:8083/api'; // Base API URL

  constructor(private http: HttpClient) {}


  getFicheEvalByEntretienId(entretienId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/fiche-eval/entretien/${entretienId}`);
  }

  //fiche RH

 updateStatutFicheRh(ficheEvalId: number, ficheRhId: number, body: { statutId: number }): Observable<any> {
  const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  return this.http.put( // Changé de patch à put
    `${this.apiUrl}/fiches-rh/fiche-eval/${ficheEvalId}/fiches-rh/${ficheRhId}/statut`,
    body,
    { 
      headers,
      withCredentials: true 
    }
  );
}

updateFicheEval(id: number, updateData: any): Observable<any> {
  return this.http.patch(`${this.apiUrl}/fiche-evals/${id}`, updateData);
}

  addOrUpdateCompetencesRh(ficheEvalId: number, ficheRhId: number, competences: CompetenceScoreDTO[]): Observable<any> {
    const payload = { competences: competences };
    return this.http.post<any>(`${this.apiUrl}/fiches-rh/fiche-eval/${ficheEvalId}/fiches-rh/${ficheRhId}/competences`, payload);
  }

  getAvailableCompetencesRh(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/competences`); 
  }


  /*addOrUpdateExigencesTech(ficheEvalId: number, ficheTechId: number, exigences: ExigenceScoreDTO[]): Observable<any> {
    const payload = { exigences: exigences };
    return this.http.post<any>(`${this.apiUrl}/fiches-tech/fiche-eval/${ficheEvalId}/fiches-tech/${ficheTechId}/exigences`, payload);
  }

  getAvailableExigencesTech(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/competencetechniques`); // Ajustez si nécessaire
  }*/

    //fiche Tech

  getAvailableExigencesTech(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/competencetechniques`);
  }

  addOrUpdateExigencesTech(ficheEvalId: number, ficheTechId: number, dtoList: ExigenceScoreDTO[]): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/fiches-tech/fiche-eval/${ficheEvalId}/fiches-tech/${ficheTechId}/exigences`,
    { exigences: dtoList }
  );
}

 updateStatutFicheTech(ficheEvalId: number, ficheTechId: number, payload: { statutId: number }): Observable<any> {
  const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  return this.http.put( // Changé de PATCH à PUT
    `${this.apiUrl}/fiches-tech/fiche-eval/${ficheEvalId}/fiches-tech/${ficheTechId}/statut`,
    payload,
    { 
      headers,
      withCredentials: true 
    }
  );
}

updateFicheScore(ficheId: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/fiche-eval/${ficheId}/update-score`, {});
}
    private ficheUpdateSource = new BehaviorSubject<void>(null);
  ficheUpdated$ = this.ficheUpdateSource.asObservable();


  notifyFicheUpdate() {
    this.ficheUpdateSource.next();
  }
}