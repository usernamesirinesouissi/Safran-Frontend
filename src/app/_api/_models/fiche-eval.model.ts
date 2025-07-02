import { Competence } from './competence.model';
import {  EntretienDetail } from './entretien.model';
import { FicheRh } from './fiche-eval-rh-response.dto';
import { FicheTech } from './fiche-eval-tech.model';
import { FicheRhCompetence } from './fiche-rh-competence.model';
import { Statut } from './statut.model';

/*
export interface FicheEvalRh {
  
    id?: number;
    candidateId: number;
    competences: FicheRhCompetence[];
    dateCreation?: Date;
    scoreTotalRh?: number;
    statut?: Statut;
  }*/


  /*export interface FicheEval {
    id: number;
    ficheRh: FicheEvalRhResponseDTO | null;
    ficheTech: FicheEvalTech | null;
    statut: Statut | null;
    scoreTotal: number | null; 
  
    candidatNom?: string; 
    sujetPrincipal?: string; 
    dateCreation?: string; 
  }
  */export interface FicheEval {
  entretien: any;
  sujetPrincipal: any;
  id?: number; // ID de la FicheEval
  statut?: Statut; // Statut global de la fiche
  scoreTotal?: number;
  entretienId?: number; // ID de l'entretien directement lié à la fiche (venant de la BDD table entretien.fiche_eval_id)

  candidatNomComplet?: string;
  referenceSujet?: string;
  typeStage?: string;
 statutGlobal?: Statut;
  _entretienDetails?: EntretienDetail; 


ficheRh?: FicheRh;       // <<< NESTED FicheRh object
  ficheTech?: FicheTech;
}

export { Statut };
