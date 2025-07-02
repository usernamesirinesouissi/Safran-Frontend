import { FicheRhCompetence } from "./fiche-rh-competence.model";
import { Statut } from "./statut.model";

export interface FicheRh {
  id?: number; // This would be the ficheRhId (e.g., 10011)
  statut?: Statut; // Could be fiche.statutRh from the main object
  scoreTotalRh?: number; // This is likely fiche.scoreRh from the main object
  commentairesGlobaux?: string;
  competences?: FicheRhCompetence[]; // Array of RH competencies
  // ... other properties for FicheRh
}