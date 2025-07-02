import { Injectable } from "@angular/core"
import {  HttpClient, HttpHeaders } from "@angular/common/http"
import  { Observable } from "rxjs"
import {
   AddCompetenceRequest,
   CompetenceDTO,
   EvaluationCompetenceRHDTO,
   EvaluationCompetenceTechDTO,
   EvaluationStage,
   NiveauEvaluationDTO,
   TypeEvaluation,
  UpdateCompetenceRequest,
} from "../_api/_models/evaluation.model"
import { map, catchError, switchMap } from "rxjs/operators"

@Injectable({
  providedIn: "root",
})
export class EvaluationService {
  private baseUrl = "http://localhost:8083/api"

  constructor(private http: HttpClient) {}

  getEvaluationForCandidature(candidatureId: number): Observable<EvaluationStage> {
    return this.http.get<EvaluationStage>(`${this.baseUrl}/evaluations/by-candidature/${candidatureId}`)
  }

  getEvaluatedRhCompetencies(evaluationId: number): Observable<EvaluationCompetenceRHDTO[]> {
    return this.http.get<EvaluationCompetenceRHDTO[]>(`${this.baseUrl}/evaluations/${evaluationId}/competences-rh`)
  }

  getEvaluatedTechCompetencies(evaluationId: number): Observable<EvaluationCompetenceTechDTO[]> {
    return this.http.get<EvaluationCompetenceTechDTO[]>(`${this.baseUrl}/evaluations/${evaluationId}/competences-tech`)
  }

  getAllRhCompetencies(): Observable<CompetenceDTO[]> {
    return this.http.get<CompetenceDTO[]>(`${this.baseUrl}/competences`)
  }

  getAllTechCompetencies(): Observable<CompetenceDTO[]> {
    return this.http.get<CompetenceDTO[]>(`${this.baseUrl}/competencetechniques`)
  }

  getAllNiveaux(): Observable<NiveauEvaluationDTO[]> {
    return this.http.get<NiveauEvaluationDTO[]>(`${this.baseUrl}/niveaux-evaluation`)
  }

  getAllTypesEvaluation(): Observable<TypeEvaluation[]> {
    return this.http.get<TypeEvaluation[]>(`${this.baseUrl}/type-evaluations`)
  }

  addRhCompetenceToEvaluation(
    evaluationId: number,
    request: AddCompetenceRequest,
  ): Observable<EvaluationCompetenceRHDTO> {
    return this.http.post<EvaluationCompetenceRHDTO>(
      `${this.baseUrl}/evaluations/${evaluationId}/competences-rh`,
      request,
    )
  }

  addTechCompetenceToEvaluation(
    evaluationId: number,
    request: AddCompetenceRequest,
  ): Observable<EvaluationCompetenceTechDTO> {
    return this.http.post<EvaluationCompetenceTechDTO>(
      `${this.baseUrl}/evaluations/${evaluationId}/competences-tech`,
      request,
    )
  }

  
getAllEvaluationsForCandidature(candidatureId: number): Observable<EvaluationStage[]> {
    return this.http.get<EvaluationStage[]>(
        `${this.baseUrl}/evaluations/by-candidature/${candidatureId}`
    );
}

  updateRhCompetenceForEvaluation(
    evaluationId: number,
    competenceId: number,
    request: UpdateCompetenceRequest,
  ): Observable<any> {
    const url = `${this.baseUrl}/evaluations/${evaluationId}/competences-rh/${competenceId}`
    return this.http.put(url, request)
  }

  updateTechCompetenceForEvaluation(
    evaluationId: number,
    competenceId: number,
    request: UpdateCompetenceRequest,
  ): Observable<any> {
    const url = `${this.baseUrl}/evaluations/${evaluationId}/competences-tech/${competenceId}`
    return this.http.put(url, request)
  }

  // NOUVELLE MÉTHODE : Créer ou récupérer une évaluation pour une candidature et un type
  getOrCreateEvaluationForCandidatureAndType(candidatureId: number, typeEvalId: number): Observable<EvaluationStage> {
    // Utiliser le nouvel endpoint si vous avez choisi la Solution 1
    const url = `${this.baseUrl}/evaluations/for-candidature/${candidatureId}/type/${typeEvalId}`
    return this.http.post<EvaluationStage>(url, {})
  }

  // ALTERNATIVE pour la Solution 2 : Créer puis définir le type
  createEvaluationThenSetType(candidatureId: number, typeEvalId: number): Observable<EvaluationStage> {
    return this.http.post<EvaluationStage>(`${this.baseUrl}/evaluations/for-candidature/${candidatureId}`, {}).pipe(
      switchMap((evaluation: EvaluationStage) => {
        return this.setEvaluationType(evaluation.id, typeEvalId).pipe(
          map(() => {
            // Mettre à jour l'objet evaluation avec le type
            evaluation.typeEvaluation = { id: typeEvalId } as TypeEvaluation
            return evaluation
          }),
        )
      }),
    )
  }

  setEvaluationType(evaluationId: number, typeId: number): Observable<any> {
    const url = `${this.baseUrl}/evaluations/${evaluationId}/type?typeId=${typeId}`

    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    }

    return this.http.put(url, {}, httpOptions).pipe(
      map((response) => {
        console.log("Réponse du serveur:", response)
        return response
      }),
      catchError((error) => {
        console.error("Erreur lors de la mise à jour du type:", error)
        throw error
      }),
    )
  }
}

export { UpdateCompetenceRequest }
