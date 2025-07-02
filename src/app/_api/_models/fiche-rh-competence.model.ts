import { Competence } from "./competence.model";

export interface FicheRhCompetence {
  id?: number; // or some unique identifier for the competence entry
  nomCompetence?: string;
  niveau?: string | number;
  commentaires?: string;
  // ... any other properties specific to an RH competence
}