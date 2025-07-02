interface CandidatInfo {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  lieu_naissance?: string;
}

interface DemandeInfo {
  reference?: string;
  intitule_projet?: string;
  type_stage_id?: number;
  duree_estime?: number;
}

interface CandidatureInfo {
  candidat?: CandidatInfo;
  demande?: DemandeInfo;
}

interface EntretienInfo {
  date_heure?: string;
  duree_en_minutes?: number;
  lieu?: string;
  candidature?: CandidatureInfo;
}

export interface FicheEval {
  id?: number;
  // ... autres propriétés existantes ...
  entretienSpecifique?: EntretienInfo;
}