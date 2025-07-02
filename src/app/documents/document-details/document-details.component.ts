import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../document.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.css']
})
export class DocumentDetailsComponent implements OnInit {
  candidateId!: number;
  candidateName: string = '';
  documents: any[] = [];
  filteredDocuments: any[] = [];
  documentTypes: any[] = [];
  isLoading: boolean = true;
  
  // Filtres
  searchText: string = '';
  selectedType: string = 'all';
  
  // Statistiques
  validDocumentsCount: number = 0;
  expiredDocumentsCount: number = 0;
  totalSize: number = 0;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) { }

  ngOnInit(): void {
    this.candidateId = +this.route.snapshot.paramMap.get('candidateId')!;
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    
    // Utilisation de la méthode existante getAllDocuments avec filtrage
    this.documentService.getAllDocuments().subscribe({
      next: (allDocuments) => {
        // Filtrer les documents pour le candidat spécifique
        
        // Récupérer le nom du candidat (peut nécessiter un autre appel API)
        if (this.documents.length > 0) {
          this.candidateName = this.documents[0].candidateName;
        }
        
        // Charger les types de documents (si nécessaire)
        this.loadDocumentTypes();
        
        this.applyFilter();
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents', error);
        this.isLoading = false;
      }
    });
  }

  loadDocumentTypes(): void {
    // Si vous n'avez pas de méthode spécifique, récupérez les types à partir des documents
    const uniqueTypes = new Map<number, string>();
    this.documents.forEach(doc => {
      if (!uniqueTypes.has(doc.documentTypeId)) {
        uniqueTypes.set(doc.documentTypeId, doc.documentType);
      }
    });
    
    this.documentTypes = Array.from(uniqueTypes, ([id, name]) => ({ id, nomTypeDoc: name }));
  }

  applyFilter(): void {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesSearch = doc.fileName.toLowerCase().includes(this.searchText.toLowerCase()) || 
                           doc.documentType.toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesType = this.selectedType === 'all' || doc.documentTypeId == this.selectedType;
      
      return matchesSearch && matchesType;
    });
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedType = 'all';
    this.applyFilter();
  }

  calculateStats(): void {
    const now = new Date();
    this.validDocumentsCount = this.documents.filter(doc => 
      !doc.expirationDate || new Date(doc.expirationDate) > now
    ).length;
    
    this.expiredDocumentsCount = this.documents.length - this.validDocumentsCount;
    this.totalSize = this.documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
  }

  getDocumentIcon(typeId: number): string {
    const doc = this.documents.find(d => d.documentTypeId === typeId);
    const mimeType = doc?.mimeType || '';
    
    if (mimeType.includes('pdf')) {
      return 'la la-file-pdf text-danger';
    } else if (mimeType.includes('image')) {
      return 'la la-file-image text-success';
    } else if (mimeType.includes('word')) {
      return 'la la-file-word text-primary';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return 'la la-file-excel text-success';
    } else if (mimeType.includes('text')) {
      return 'la la-file-alt text-secondary';
    } else {
      return 'la la-file text-secondary';
    }
  }

  downloadDocument(document: any): void {
    this.documentService.downloadDocument(document.id).subscribe(blob => {
      saveAs(blob, document.fileName);
    });
  }

  openDocument(document: any): void {
    this.documentService.downloadDocument(document.id).subscribe(blob => {
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    });
  }

  downloadAllDocuments(): void {
    // Implémentation alternative sans méthode spécifique
    const downloadPromises = this.documents.map(doc => 
      this.documentService.downloadDocument(doc.id).toPromise()
    );

    Promise.all(downloadPromises).then(blobs => {
      // Créer un ZIP avec JSZip (nécessite l'installation de jszip)
      import('jszip').then(JSZip => {
        const zip = new JSZip.default();
        
        blobs.forEach((blob, index) => {
          const doc = this.documents[index];
          zip.file(doc.fileName, blob);
        });
        
        zip.generateAsync({ type: 'blob' }).then(content => {
          saveAs(content, `Documents_${this.candidateName.replace(' ', '_')}.zip`);
        });
      });
    });
  }
}