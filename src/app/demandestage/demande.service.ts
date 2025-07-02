import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Demande } from './demande.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  
  private apiUrl = 'http://localhost:8083/api/demandes';
  private baseUrl = 'http://localhost:8083/api/workflows';
  constructor(private http: HttpClient) { }

 getCompetencesComportementales(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/competencescomp`).pipe(
    map(data => data.map(item => ({ id: item.id, nom: item.nomCompetence })))
  );
}

getCompetencesTechniques(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/competencestech`).pipe(
    map(data => data.map(item => ({ id: item.id, nom: item.nomExigence })))
  );
}

getFormationsAcademiques(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/formationsacademiques`).pipe(
    map(data => data.map(item => ({ id: item.id, nom: item.nomFormation })))
  );
}

getPropositionsEcoles(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/propositionsecoles`).pipe(
    map(data => data.map(item => ({ id: item.id, nom: item.nomEcole })))
  );
}
getTypeStage(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/typestage`).pipe(
    map(data => data.map(item => ({ id: item.id, nom: item.nomTypeStage })))
  );
}
createDemande(demande: Demande): Observable<Demande> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('admin:admin')
  });

  return this.http.post<Demande>(`${this.apiUrl}/ajout`, demande, { headers });
}
  getDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(this.apiUrl);
  }
  getSujets(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/sujets`);
  }
  getDemandeById(id: number): Observable<Demande> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(apiResponse => ({
        ...apiResponse,
        competencescomportementale: apiResponse.competencescomportementale.map(c => ({
          id: c.id,
          nom: c.nomCompetence 
        })),
        competencestechnique: apiResponse.competencestechnique.map(e => ({
          id: e.id,
          nom: e.nomExigence
        })),
        formationacademique: apiResponse.formationacademique.map(f => ({
          id: f.id,
          nom: f.nomFormation 
        })),
        propecole: apiResponse.propecole.map(p => ({
          id: p.id,
          nom: p.nomEcole 
        })),
        statut: {
          id: apiResponse.statut.id,
          nom: apiResponse.statut.nomStatut
        }
      }))
    );
  }
  updateDemande(demandeId: number, demande: Demande): Observable<void> {   
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('admin:admin')
    });

    return this.http.put<void>(`${this.apiUrl}/${demandeId}`, demande, { headers });
}
  deleteDemande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  completeValidation(validationId: string, decision: string, decisionBy: string, comments: string): Observable<any> {
    const url = `${this.baseUrl}/validations/${validationId}/complete`;
    const params = new HttpParams()
      .set('decision', decision)
      .set('decisionBy', decisionBy)
      .set('comments', encodeURIComponent(comments));
    
    return this.http.post(url, null, { params });
  }

  updateDemandeStatus(demandeId: number, status: { id: number }) {
    return this.http.put(`${this.apiUrl}/${demandeId}/status`, status);
  }

  approveValidation(validationId: string, decision: string, decisionBy: string, comments: string): Observable<any> {
    const url = `${this.baseUrl}/validations/${validationId}/approve`;
    const params = new HttpParams()
      .set('decision', decision)
      .set('decisionBy', decisionBy)
      .set('comments', encodeURIComponent(comments));
    
    return this.http.post(url, null, { params });
  }

  getValidationsForDemande(demandeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${demandeId}/validations`);
  }
}