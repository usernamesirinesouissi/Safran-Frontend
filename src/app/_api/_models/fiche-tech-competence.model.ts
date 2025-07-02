export interface FicheTechCompetence {
  id?: number;
  nomExigence?: string;
  niveau?: string | number;
  commentaires?: string;
  scoreCompetenceTech?: number; // <<< ADD THIS LINE
}