export interface TypeEvaluation {
  id: number;
  nomTypeEval: string;
}


export interface CompetenceDTO {
  id: number;
  nomCompetence: string;
}

export interface CompetenceDTOTech {
  id: number;
  nomExigence: string;
}

export interface NiveauEvaluationDTO {
  id: number;
  nomNiveau: string;
}

export interface EvaluationCompetenceRHDTO {
  id: number;
  evaluationId: number;
  competence: CompetenceDTO;
  niveau: NiveauEvaluationDTO | null; // Peut être null initialement
}

export interface EvaluationCompetenceTechDTO {
  comptech: any;
  id: number;
  evaluationId: number;
  competence: CompetenceDTO;
  competenceTech: CompetenceDTOTech;

  niveau: NiveauEvaluationDTO | null; // Peut être null initialement
}

export interface EvaluationStage {
  id: number;
  candidature: any; // Mettez le type correct si vous l'avez
  typeEvaluation: any; // Mettez le type correct si vous l'avez
  competencesRH: EvaluationCompetenceRHDTO[];
  competencesTech: EvaluationCompetenceTechDTO[];
    completionPercentage?: number; // Nouveau champ

}

// Pour les requêtes POST
export interface AddCompetenceRequest {
  competenceId: number;
  niveauId: number;
}


export interface UpdateCompetenceRequest {
  niveauId: number;
}