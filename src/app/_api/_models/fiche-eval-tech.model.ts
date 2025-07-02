import { FicheTechCompetence } from "./fiche-tech-competence.model";
import { Statut } from "./statut.model";
export interface FicheTech {
  id?: number; // This would be the ficheTechId (e.g., 12)
  statut?: Statut; // Could be fiche.statutTech from the main object
  scoreTotalTech?: number; // This is likely fiche.scoreTech from the main object
  commentairesGlobaux?: string;
  competences?: FicheTechCompetence[]; // Array of Technical competencies
  // ... other properties for FicheTech
}