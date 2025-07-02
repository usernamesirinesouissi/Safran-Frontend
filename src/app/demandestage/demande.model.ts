export interface Demande {
    id?: number;
    intituleProjet: string;
    descriptionProjet: string;
    risquesProjet: string;
    objectifsProjet: string;
    descriptionLivrables: string;
    reference: string;
    effortEstime: string;
    dureeEstime: number;
    nombreStagiaires: number;
    nombreStagiairesAffectes: number;
    competencescomportementale: CompetenceComportementale[];
    competencestechnique: ExigenceTechnique[];
    formationacademique: FormationAcademique[];
    propecole: PropositionEcole[];
    statut?: Statut;
    typeStage?: TypeStage;
  }
  
  export interface CompetenceComportementale {
    id: number;
    nom: string;
  }
  
  export interface ExigenceTechnique {
    id: number;
    nom: string;
  }
  
  export interface FormationAcademique {
    id: number;
    nom: string;
  }
  
  export interface PropositionEcole {
    id: number;
    nom: string;
  }
  
  export interface Statut {
    nomStatut: any;
    id: number;
    nom: string;
  }
  export interface TypeStage {
    id: number;
    nomTypeStage: string;
  }