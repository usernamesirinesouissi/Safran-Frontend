import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FicheEvalService, CompetenceScoreDTO } from '../../services/fiche-eval.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-fiche-eval-rh',
  templateUrl: './fiche-eval-rh.component.html',
  styleUrls: ['./fiche-eval-rh.component.css']
})
export class FicheEvalRhComponent implements OnInit, OnChanges {
  @Input() ficheEvalId: number;
  @Input() ficheRh: any;
  @Output() rhUpdated = new EventEmitter<void>();

  competencesEvaluees: any[] = [];
  availableCompetences: any[] = [];
  levelValues = [0, 20, 40, 60, 80]; // 0=0, 1=20, 2=40, 3=60

  @ViewChild('selectCompModal') private selectCompModalTemplate: TemplateRef<any>;
  selectedCompetencesInModal: any[] = [];

  isLoading = false;
  isLoadingModalContent = false;
  isSavingStatut = false;

  dropdownOpen = false;

statutOptions = [
  { id: 20004, nom: 'A revoir RH',    colorClass: 'status-revoir-rh' }, // Custom class for "A revoir RH"
  { id: 2,     nom: 'Retenu RH',      colorClass: 'status-retenu-rh' }, // Custom class for "Retenu RH"
  { id: 3,     nom: 'Non Retenu RH',  colorClass: 'status-non-retenu-rh' }, // Custom class for "Non Retenu RH"
  { id: 10005, nom: 'Vivier',         colorClass: 'status-vivier' }, // Custom class for "Vivier"
  { id: 20005, nom: 'Liste rouge RH', colorClass: 'status-liste-rouge-rh' } // Custom class for "Liste rouge RH"
];

  selectedStatutId: number | null = null;
  documentClickListener: () => void;

  constructor(
    private ficheEvalService: FicheEvalService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
     private renderer: Renderer2
  ) {this.documentClickListener = this.renderer.listen('document', 'click', (event) => {
      if (!event.target.closest('.status-dropdown-container')) {
        this.dropdownOpen = false;
        this.cdr.detectChanges();
      }
    });}


    ngOnDestroy() {
    // N'oubliez pas de nettoyer l'écouteur d'événements
    if (this.documentClickListener) {
      this.documentClickListener();
    }
  }

  ngOnInit(): void {
    this.loadAvailableCompetences();
    this.populateExistingCompetences();
    this.initStatutSelection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.ficheRh && changes.ficheRh.currentValue) {
      this.populateExistingCompetences();
      this.initStatutSelection();
    }
  }

  initStatutSelection(): void {
    if (this.ficheRh?.statut) {
      this.selectedStatutId = this.ficheRh.statut.id;
    }
  }

 async changeStatut(statutId: number): Promise<void> {
    if (this.isSavingStatut || this.selectedStatutId === statutId) return;

    // Sauvegarde de l'ancien état pour rollback
    const oldStatutId = this.selectedStatutId;
    const oldScore = this.ficheRh.scoreTotalRh;

    // Mise à jour optimiste
    this.selectedStatutId = statutId;
    this.ficheRh.statut = {
        id: statutId,
        nomStatut: this.statutOptions.find(s => s.id === statutId)?.nom || ''
    };

    this.isSavingStatut = true;

    try {
        // Appel au service
        const updatedFiche = await this.ficheEvalService.updateStatutFicheRh(
            this.ficheEvalId,
            this.ficheRh.id,
            { statutId }
        ).toPromise();

        // Mise à jour complète avec la réponse du serveur
        this.ficheRh = {
            ...this.ficheRh,
            statut: updatedFiche.statut,
            scoreTotalRh: updatedFiche.scoreTotalRh // IMPORTANT: Prendre le score du backend
        };

        this.toastr.success('Statut et score mis à jour');
        this.rhUpdated.emit(); // Notifier le parent
    } catch (error) {
        // Rollback en cas d'erreur
        this.selectedStatutId = oldStatutId;
        this.ficheRh.statut = oldStatutId ? {
            id: oldStatutId,
            nomStatut: this.statutOptions.find(s => s.id === oldStatutId)?.nom || ''
        } : null;
        this.ficheRh.scoreTotalRh = oldScore;

        this.toastr.error('Échec de la mise à jour', 'Erreur');
        console.error('Erreur:', error);
    } finally {
        this.isSavingStatut = false;
        this.cdr.detectChanges(); // Forcer la détection de changements
    }
}

private async saveStatutOnly(statutId: number): Promise<void> {
  try {
    if (!this.ficheEvalId || !this.ficheRh?.id) {
      throw new Error('IDs manquants');
    }

    await this.ficheEvalService.updateStatutFicheRh(
      this.ficheEvalId,
      this.ficheRh.id,
      { statutId }
    ).toPromise();

    this.rhUpdated.emit();
    this.toastr.success('Statut mis à jour avec succès');
  } catch (error) {
    console.error('Erreur:', error);
    this.toastr.error(
      error.message || 'Erreur lors de la mise à jour du statut',
      'Erreur'
    );
    throw error;
  }
}


private removeDuplicateCompetences(competences: any[]): any[] {
  const uniqueCompetences = [];
  const competenceIds = new Set();

  competences.forEach(comp => {
    if (!competenceIds.has(comp.id)) {
      competenceIds.add(comp.id);
      uniqueCompetences.push(comp);
    }
  });

  return uniqueCompetences;
}

  showLevelValue(level: number): void {
    const value = this.levelValues[level];
 
  }

  getLevelValue(level: number): number {
    return this.levelValues[level] || 0;
  }

 populateExistingCompetences(): void {
  if (this.ficheRh && this.ficheRh.competences) {
    const uniqueCompetences = this.removeDuplicateCompetences(this.ficheRh.competences);
    
    this.competencesEvaluees = uniqueCompetences.map(c => {
      const valeurExistante = c.scoreCompetenceRh;
      const estDejaValeur = this.levelValues.includes(valeurExistante);
      
      return {
        ...c,
        scoreCompetenceRh: estDejaValeur ? this.levelValues.indexOf(valeurExistante) : valeurExistante,
        valeurScore: estDejaValeur ? valeurExistante : this.getScoreValue(valeurExistante)
      };
    });
  } else {
    this.competencesEvaluees = [];
  }
}

  loadAvailableCompetences(): void {
    this.isLoadingModalContent = true;
    this.ficheEvalService.getAvailableCompetencesRh().subscribe(
      data => {
        this.availableCompetences = data;
        this.isLoadingModalContent = false;
      },
      err => {
        this.toastr.error('Erreur chargement compétences RH disponibles.', 'Erreur');
        this.isLoadingModalContent = false;
      }
    );
  }

  openSelectCompetencesModal() {
    this.selectedCompetencesInModal = [];
    const modalRef = this.modalService.open(this.selectCompModalTemplate, { 
      size: 'lg', 
      centered: true, 
      scrollable: true 
    });

    modalRef.result.then(
      (result: any[]) => {
        if (result && result.length > 0) {
          this.addSelectedCompetencesFromModal(result);
        }
      },
      (reason) => {
        console.log(`Modal dismissed with reason: ${reason}`);
      }
    );
  }

  isSelected(competence: any): boolean {
    return this.selectedCompetencesInModal.some(c => c.id === competence.id);
  }

  toggleSelection(competence: any): void {
    if (this.isSelected(competence)) {
      this.selectedCompetencesInModal = this.selectedCompetencesInModal.filter(c => c.id !== competence.id);
    } else {
      this.selectedCompetencesInModal.push(competence);
    }
  }

  isAlreadyEvaluated(competenceId: number): boolean {
    return this.competencesEvaluees.some(c => c.competence.id === competenceId);
  }

  addSelectedCompetencesFromModal(selectedCompetences: any[]): void {
    const nouvellesCompetencesAAjouter = selectedCompetences
      .filter(comp => !this.isAlreadyEvaluated(comp.id))
      .map(comp => ({
        id: null,
        competence: {
          id: comp.id,
          nomCompetence: comp.nomCompetence
        },
        scoreCompetenceRh: 0
      }));

    if (nouvellesCompetencesAAjouter.length > 0) {
      this.competencesEvaluees = [...this.competencesEvaluees, ...nouvellesCompetencesAAjouter];
    }
  }

  removeCompetence(index: number): void {
    this.competencesEvaluees.splice(index, 1);
  }

  private getScoreValue(level: number): number {
    return this.levelValues[level] || 0;
  }

 onScoreChange(competenceItem: any, level: number): void {
  this.competencesEvaluees = this.competencesEvaluees.map(c => {
    // Comparer avec competenceItem.competence.id au lieu de c.id
    if (c.competence.id === competenceItem.competence.id) {
      return {
        ...c,
        scoreCompetenceRh: level,
        valeurScore: this.getScoreValue(level)
      };
    }
    return c;
  });
  this.cdr.detectChanges();
}
  saveChanges(): void {
    if (!this.ficheRh || !this.ficheRh.id || !this.ficheEvalId) {
      this.toastr.error("Informations manquantes", "Erreur");
      return;
    }

    this.isLoading = true;
    
    const dtoList: CompetenceScoreDTO[] = this.competencesEvaluees.map(c => ({
      competenceId: c.competence.id,
      score: this.getScoreValue(c.scoreCompetenceRh)
    }));

    this.ficheEvalService.addOrUpdateCompetencesRh(this.ficheEvalId, this.ficheRh.id, dtoList).subscribe(
      () => {
        this.toastr.success('Sauvegarde réussie!', 'Succès');
        this.ficheEvalService.notifyFicheUpdate();

        this.rhUpdated.emit();
        this.isLoading = false;
      },
      (error) => {
        this.toastr.error('Erreur de sauvegarde', 'Erreur');
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    );
  }

  getSliderLevelText(score: number): string {
    return `${score}`;
  }


toggleDropdown(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  this.dropdownOpen = !this.dropdownOpen;
}
getCurrentStatusName(): string {
  const found = this.statutOptions.find(s => s.id === this.selectedStatutId);
  return found ? found.nom : 'Sélectionner un statut';
}

getCurrentStatusClass(): string {
  const found = this.statutOptions.find(s => s.id === this.selectedStatutId);
  if (!found) return 'secondary';
  
  // Retourne 'success', 'warning' ou 'danger' selon le statut
  return found.colorClass.replace('status-', '');
}
}