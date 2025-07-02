import { Demande } from 'src/app/demandestage/demande.model';
import { Candidat } from './candidate.model';
import { StatutCandidature } from './statut-candidature.model';

export interface Candidature {
  id?: number;
  candidat?: Candidat;
  demande?: Demande;
  // autres propriétés
}