import { Candidature } from "./candidature.model";

export interface EntretienDetail {
  id?: number; // ID de l'entretien
  candidature?: Candidature;
  // ficheEvalAssociee?: FicheEval; // Peut causer des références circulaires si FicheEval contient EntretienDetail
  // autres champs de l'entretien si besoin
}