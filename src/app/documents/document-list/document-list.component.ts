import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DocumentService } from '../document.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { DocumentResponseDTO, TypeDocumentResponseDTO } from '../document.model';
import { TypeDocumentService } from '../type-document.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>;
    fileNameFilter: string = '';
  candidateNameFilter: string = '';
  documentTypeFilter: string | number = '';
  breadcrumb: any;
  documents: DocumentResponseDTO[] = [];
  filteredDocuments: DocumentResponseDTO[] = [];
  isLoading = true;
  errorMessage = '';

  selectedCandidates = new Map<number, boolean>();
    private downloadQueue: {id: number, fileName: string, folderPath: string}[] = [];
  private isProcessingQueue = false;
  private activeDownloads: {[key: string]: boolean} = {};
  private downloadTimers: {[key: number]: any} = {};
  // Filtres
  filterFileName = '';
  filterCandidateName = '';
  filterDocumentType = '';
  documentTypes: TypeDocumentResponseDTO[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Pour la modal de suppression
  documentToDeleteId: number | null = null;

  // Structure pour stocker l'état des documents par candidat et type
  candidateDocumentStatus: {
    [candidateId: number]: {
      candidateName: string,
      documents: {
        [typeId: number]: {
          exists: boolean,
          documentId?: number,
          fileName?: string
        }
      }
    }
  } = {};

  constructor(
    private documentService: DocumentService,
    private typeDocumentService: TypeDocumentService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setupBreadcrumb();
    this.loadDocumentTypes();
  }

  

  // AJOUT DE LA MÉTHODE MANQUANTE
  getCandidateIds(): number[] {
    return Object.keys(this.candidateDocumentStatus).map(id => parseInt(id));
  }

  setupBreadcrumb(): void {
    this.breadcrumb = {
      'mainlabel': 'Gestion des Documents',
      'links': [
        {
          'name': 'Tableau de bord',
          'isLink': true,
          'link': '/dashboard'
        },
        {
          'name': 'Documents',
          'isLink': false,
          'link': '#'
        }
      ]
    };
  }

  loadDocumentTypes(): void {
    this.typeDocumentService.getAllTypeDocuments().subscribe({
      next: (types) => {
        this.documentTypes = types;
        this.loadDocuments();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des types de documents', err);
        this.toastr.error('Erreur lors du chargement des types de documents', 'Erreur');
        this.loadDocuments();
      }
    });
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getAllDocuments().subscribe({
      next: (data) => {
        this.documents = data;
        this.totalItems = data.length;
        this.buildCandidateDocumentStatus();
        this.applyFilters();
        
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des documents';
        this.isLoading = false;
        console.error(err);
        this.toastr.error('Erreur lors du chargement des documents', 'Erreur');
      }
    });
  }

  // Construit la structure d'état des documents par candidat et type
  buildCandidateDocumentStatus(): void {
    this.candidateDocumentStatus = {};
    
    // Initialiser la structure pour tous les candidats et types
    this.documents.forEach(doc => {
      const candidateId = doc.candidature.candidat.id;
      const candidateName = `${doc.candidature.candidat.nomCandidat} ${doc.candidature.candidat.prenomCandidat}`;
      
      if (!this.candidateDocumentStatus[candidateId]) {
        this.candidateDocumentStatus[candidateId] = {
          candidateName: candidateName,
          documents: {}
        };
        
        // Initialiser tous les types à "non existant"
        this.documentTypes.forEach(type => {
          this.candidateDocumentStatus[candidateId].documents[type.id] = {
            exists: false
          };
        });
      }
    });
    
    // Mettre à jour avec les documents existants
    this.documents.forEach(doc => {
      const candidateId = doc.candidature.candidat.id;
      const typeId = doc.type.id;
      
      if (this.candidateDocumentStatus[candidateId]) {
        this.candidateDocumentStatus[candidateId].documents[typeId] = {
          exists: true,
          documentId: doc.id,
          fileName: doc.nomFichier
        };
      }
    });
  }

   applyFilters(): void {
    console.log('Filtres appliqués:', {
      fileName: this.fileNameFilter,
      candidateName: this.candidateNameFilter,
      documentType: this.documentTypeFilter
    });
    // this.loadDocuments(); // Décommentez quand vous implémenterez le service
  }

  resetFilters(): void {
    this.fileNameFilter = '';
    this.candidateNameFilter = '';
    this.documentTypeFilter = '';
    this.applyFilters();
  }
  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get firstItemOnPage(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get lastItemOnPage(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  /*downloadDocument(id: number, fileName: string): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement', err);
        this.toastr.error('Erreur lors du téléchargement du fichier', 'Erreur');
      }
    });
  }*/

  openDeleteConfirmationModal(id: number): void {
    this.documentToDeleteId = id;
    this.modalService.open(this.deleteModal).result.then(
      (result) => {
        if (result === 'delete') {
          this.deleteDocument();
        }
      },
      () => {
        this.documentToDeleteId = null;
      }
    );
  }

  deleteDocument(): void {
    if (!this.documentToDeleteId) return;

    this.documentService.deleteDocument(this.documentToDeleteId).subscribe({
      next: () => {
        this.toastr.success('Document supprimé avec succès', 'Succès');
        this.loadDocuments();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression', err);
        this.toastr.error('Erreur lors de la suppression du document', 'Erreur');
      }
    });
    
    this.documentToDeleteId = null;
  }

  // Vérifie si un document existe pour un candidat et un type donné
  documentExists(candidateId: number, typeId: number): boolean {
    return this.candidateDocumentStatus[candidateId]?.documents[typeId]?.exists || false;
  }

  // Récupère le nom du fichier pour un document spécifique
  getDocumentFileName(candidateId: number, typeId: number): string {
    return this.candidateDocumentStatus[candidateId]?.documents[typeId]?.fileName || '';
  }

  // Récupère l'ID du document pour un candidat et un type donné
  getDocumentId(candidateId: number, typeId: number): number | undefined {
    return this.candidateDocumentStatus[candidateId]?.documents[typeId]?.documentId;
  }



   /*downloadAllCandidateDocuments(candidateId: number, candidateName: string) {
    // Récupérer tous les documents du candidat
    const candidateDocuments = this.documents.filter(
      doc => doc.candidature.candidat.id === candidateId
    );

    if (candidateDocuments.length === 0) {
      this.toastr.warning('Aucun document disponible pour ce candidat', 'Avertissement');
      return;
    }

    // Télécharger chaque document individuellement
    candidateDocuments.forEach(doc => {
      this.downloadDocument(
        doc.id, 
        `${candidateName.replace(/\s+/g, '_')}_${doc.nomFichier}`
      );
    });

    this.toastr.info(`Téléchargement de ${candidateDocuments.length} documents lancé`, 'Téléchargement');
  }*/

  // Méthode existante de téléchargement (légèrement modifiée)
  /*downloadDocument(id: number, fileName: string): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement', err);
        this.toastr.error('Erreur lors du téléchargement du fichier', 'Erreur');
      }
    });
  }*/


 

  private saveFile(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Libérer la mémoire après un délai
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  downloadDocument(id: number, fileName: string): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => this.saveFile(blob, fileName),
      error: (err) => {
        console.error('Erreur de téléchargement', err);
        this.toastr.error('Échec du téléchargement', 'Erreur');
      }
    });
  }
  async downloadAllCandidateDocuments(candidateId: number, candidateName: string) {
    // Récupérer tous les documents du candidat
    const candidateDocuments = this.documents.filter(
      doc => doc.candidature.candidat.id === candidateId
    );

    if (candidateDocuments.length === 0) {
      this.toastr.warning('Aucun document disponible pour ce candidat', 'Avertissement');
      return;
    }

    // Bloquer les téléchargements multiples pour ce candidat
    if (this.activeDownloads[candidateId]) {
      this.toastr.info('Téléchargement déjà en cours pour ce candidat', 'Information');
      return;
    }

    this.activeDownloads[candidateId] = true;
  
  
    try {
      const zip = new JSZip();
      const folder = zip.folder(candidateName.replace(/[^a-z0-9]/gi, '_'));

      // Télécharger chaque document et l'ajouter au zip
      for (const doc of candidateDocuments) {
        const blob = await this.documentService.downloadDocument(doc.id).toPromise();
        folder.file(doc.nomFichier, blob);
      }

      // Générer le zip
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${candidateName.replace(/[^a-z0-9]/gi, '_')}_documents.zip`);

      this.toastr.success(`Tous les documents de ${candidateName} ont été téléchargés`, 'Succès', { timeOut: 3000 });
    } catch (err) {
      console.error('Erreur lors de la création de l\'archive', err);
      this.toastr.error('Erreur lors du téléchargement des documents', 'Erreur');
    } finally {
      delete this.activeDownloads[candidateId];
     
    }
  }

  private processDownloadQueue() {
    if (this.downloadQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const nextDoc = this.downloadQueue.shift()!;

    // Vérifier si ce document est déjà en cours de téléchargement
    if (this.downloadTimers[nextDoc.id]) {
      clearTimeout(this.downloadTimers[nextDoc.id]);
      delete this.downloadTimers[nextDoc.id];
    }

    // Créer un élément virtuel de dossier
    this.createVirtualFolder(nextDoc.folderPath);

    this.documentService.downloadDocument(nextDoc.id).subscribe({
      next: (blob) => {
        this.saveFileToFolder(blob, nextDoc.fileName, nextDoc.folderPath);
        
        // Libérer le candidat si c'était son dernier document
        const candidateId = this.getCandidateIdByDocumentId(nextDoc.id);
        if (candidateId && this.isCandidateDownloadComplete(candidateId)) {
          delete this.activeDownloads[candidateId];
        }
        
        // Passer au document suivant après un court délai
        this.downloadTimers[nextDoc.id] = setTimeout(() => {
          this.processDownloadQueue();
        }, 800);
      },
      error: (err) => {
        console.error('Erreur de téléchargement', err);
        this.toastr.error(`Échec: ${nextDoc.fileName}`, 'Erreur');
        
        // Passer au document suivant même en cas d'erreur
        this.downloadTimers[nextDoc.id] = setTimeout(() => {
          this.processDownloadQueue();
        }, 300);
      }
    });
  }

  private createVirtualFolder(folderPath: string) {
    // Cette fonction "triche" en créant un fichier .folder pour forcer la création du dossier
    const folderBlob = new Blob([], { type: 'application/x-directory' });
    const folderUrl = URL.createObjectURL(folderBlob);
    const a = document.createElement('a');
    a.href = folderUrl;
    a.download = `${folderPath}/.folder`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(folderUrl);
  }

  private saveFileToFolder(blob: Blob, fileName: string, folderPath: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderPath}/${fileName}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Libérer la mémoire après un délai
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private getCandidateIdByDocumentId(documentId: number): number | null {
    const doc = this.documents.find(d => d.id === documentId);
    return doc ? doc.candidature.candidat.id : null;
  }

  private isCandidateDownloadComplete(candidateId: number): boolean {
    return !this.downloadQueue.some(item => {
      const doc = this.documents.find(d => d.id === item.id);
      return doc && doc.candidature.candidat.id === candidateId;
    });
  }
  /**
   * FIX 2: Définition de la méthode isSelected qui manquait.
   * Vérifie si un candidat est sélectionné.
   */
  isSelected(candidateId: number): boolean {
    return this.selectedCandidates.has(candidateId);
  }

  /**
   * Gère le clic sur une case à cocher individuelle.
   */
  toggleSelection(candidateId: number, event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedCandidates.set(candidateId, true);
    } else {
      this.selectedCandidates.delete(candidateId);
    }
  }

  /**
   * Vérifie si toutes les lignes actuellement visibles sont sélectionnées.
   */
  isAllSelected(): boolean {
    const visibleIds = this.getCandidateIds();
    if (visibleIds.length === 0) {
      return false;
    }
    // Appel à this.isSelected(id) qui est maintenant défini
    return visibleIds.every(id => this.isSelected(id));
  }

  /**
   * Gère le clic sur la case "Tout sélectionner".
   */
  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    const visibleIds = this.getCandidateIds();
    visibleIds.forEach(id => {
      if (isChecked) {
        this.selectedCandidates.set(id, true);
      } else {
        this.selectedCandidates.delete(id);
      }
    });
  }

  /**
   * Télécharge un ZIP contenant les documents de TOUS les candidats sélectionnés.
   */
  async downloadSelectedCandidates(): Promise<void> {
    const selectedIds = Array.from(this.selectedCandidates.keys());
    if (selectedIds.length === 0) {
      this.toastr.info('Veuillez sélectionner au moins un candidat.', 'Information');
      return;
    }

    const toastId = this.toastr.info(
      `Préparation d'une archive pour ${selectedIds.length} candidat(s)...`,
      'Téléchargement groupé',
      { disableTimeOut: true }
    );

    try {
      const zip = new JSZip();
      for (const candidateId of selectedIds) {
        const candidateName = this.candidateDocumentStatus[candidateId].candidateName;
        const safeCandidateName = candidateName.replace(/[^a-zA-Z0-9]/g, '_');
        const candidateFolder = zip.folder(safeCandidateName);

        const documentsToDownload = this.documents.filter(
          doc => doc.candidature.candidat.id === candidateId
        );

       // ...
const downloadPromises = documentsToDownload.map(doc =>
  this.documentService.downloadDocument(doc.id).toPromise() // Ligne corrigée
    .then(blob => ({
      name: doc.nomFichier,
      data: blob
    }))
);

        
        const downloadedFiles = await Promise.all(downloadPromises);
        downloadedFiles.forEach(file => {
          candidateFolder?.file(file.name, file.data);
        });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'Selection_Candidats_Documents.zip');
      this.toastr.success('Archive ZIP téléchargée avec succès.', 'Succès');

    } catch (error) {
      console.error("Erreur lors de la création de l'archive groupée", error);
      this.toastr.error("Échec de la création de l'archive.", 'Erreur');
    }
  }


}