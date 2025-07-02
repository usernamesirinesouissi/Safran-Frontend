export interface CandidatMinimalDTO {
  id: number;
  nomCandidat: string;
  prenomCandidat: string;
  email: string;
}

export interface CandidatureDetailsDTO {
  id: number;
  dateDepot: string;
  score: number;
  candidat: CandidatMinimalDTO;
}

export interface TypeDocumentResponseDTO {
  id: number;
  nomTypeDoc: string;
}

export interface DocumentResponseDTO {
  id: number;
  nomFichier: string;
  dateDepot: string;
  type: TypeDocumentResponseDTO;
  candidature: CandidatureDetailsDTO;
}