import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FicheEvalService, ExigenceScoreDTO } from '../../services/fiche-eval.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Renderer2 } from '@angular/core';

@Component({
  selector: 'app-fiche-eval-tech',
  templateUrl: './fiche-eval-tech.component.html',
  styleUrls: ['./fiche-eval-tech.component.css']
})
export class FicheEvalTechComponent implements OnInit, OnChanges {
  @Input() ficheEvalId: number;
  @Input() ficheTech: any;
  @Output() techUpdated = new EventEmitter<void>();

  exigencesEvaluees: any[] = [];
  availableExigences: any[] = [];
  levelValues = [0, 20, 40, 60, 80]; // 0=0, 1=20, 2=40, 3=60

  @ViewChild('selectExigencesModal') private selectExigencesModalTemplate: TemplateRef<any>;
  selectedExigencesInModal: any[] = [];

  isLoading = false;
  isLoadingModalContent = false;
  isSavingStatut = false;
  dropdownOpen = false;

statutOptions = [
  { id: 20007, nom: 'A revoir Technique',  colorClass: 'status-revoir-rh' },
  { id: 5,     nom: 'Retenu Tech',      colorClass: 'status-retenu-tech' },     
  { id: 4,     nom: 'Non Retenu Tech',  colorClass: 'status-non-retenu-tech' }, 
  { id: 10005, nom: 'Vivier',  colorClass: 'status-vivier' },
  { id: 20009, nom: 'Liste rouge Technique',  colorClass: 'status-liste-rouge-rh' }
];

  selectedStatutId: number | null = null;
  private documentClickListener: () => void;

  constructor(
    private ficheEvalService: FicheEvalService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.loadAvailableExigences();
    this.populateExistingExigences();
    this.initStatutSelection();

    this.documentClickListener = this.renderer.listen('document', 'click', (event) => {
      if (!event.target.closest('.status-dropdown-container')) {
        this.dropdownOpen = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.documentClickListener) {
      this.documentClickListener();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.ficheTech && changes.ficheTech.currentValue) {
      this.populateExistingExigences();
      this.initStatutSelection();
    }
  }

  initStatutSelection(): void {
    if (this.ficheTech?.statut) {
      this.selectedStatutId = this.ficheTech.statut.id;
    }
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
    if (!this.selectedStatutId) return 'btn-secondary';
    
    const found = this.statutOptions.find(s => s.id === this.selectedStatutId);
    if (!found) return 'btn-secondary';
    
    return found.colorClass.replace('btn-', 'status-btn-');
  }

  async changeStatut(statutId: number): Promise<void> {
    if (this.isSavingStatut || this.selectedStatutId === statutId) return;

    const oldStatutId = this.selectedStatutId;
    const oldScore = this.ficheTech.scoreTotalTech;

    this.selectedStatutId = statutId;
    this.ficheTech.statut = {
      id: statutId,
      nomStatut: this.statutOptions.find(s => s.id === statutId)?.nom || ''
    };

    this.isSavingStatut = true;

    try {
      const updatedFiche = await this.ficheEvalService.updateStatutFicheTech(
        this.ficheEvalId,
        this.ficheTech.id,
        { statutId }
      ).toPromise();

      this.ficheTech = {
        ...this.ficheTech,
        statut: updatedFiche.statut,
        scoreTotalTech: updatedFiche.scoreTotalTech
      };

      this.toastr.success('Statut mis à jour avec succès', 'Succès');
      this.techUpdated.emit();
    } catch (error) {
      this.selectedStatutId = oldStatutId;
      this.ficheTech.statut = oldStatutId ? {
        id: oldStatutId,
        nomStatut: this.statutOptions.find(s => s.id === oldStatutId)?.nom || ''
      } : null;
      this.ficheTech.scoreTotalTech = oldScore;

      this.toastr.error('Échec de la mise à jour du statut', 'Erreur');
      console.error('Erreur:', error);
    } finally {
      this.isSavingStatut = false;
      this.cdr.detectChanges();
    }
  }

  populateExistingExigences(): void {
    if (this.ficheTech && this.ficheTech.competences) {
      const uniqueExigences = this.removeDuplicateExigences(this.ficheTech.competences);
      
      this.exigencesEvaluees = uniqueExigences.map(e => {
        const valeurExistante = e.scoreCompetenceTech;
        const estDejaValeur = this.levelValues.includes(valeurExistante);
        
        return {
          ...e,
          scoreCompetenceTech: estDejaValeur ? this.levelValues.indexOf(valeurExistante) : valeurExistante,
          valeurScore: estDejaValeur ? valeurExistante : this.getScoreValue(valeurExistante),
          exigenceTechnique: e.exigenceTechnique || {
            id: e.competence?.id,
            nomExigence: e.competence?.nomCompetence || e.exigenceTechnique?.nomExigence
          }
        };
      });
    } else {
      this.exigencesEvaluees = [];
    }
  }

  loadAvailableExigences(): void {
    this.isLoadingModalContent = true;
    this.ficheEvalService.getAvailableExigencesTech().subscribe(
      data => {
        this.availableExigences = data;
        this.isLoadingModalContent = false;
      },
      err => {
        this.toastr.error('Erreur chargement des exigences techniques disponibles.', 'Erreur');
        this.isLoadingModalContent = false;
      }
    );
  }

  openSelectExigencesModal() {
    this.selectedExigencesInModal = [];
    const modalRef = this.modalService.open(this.selectExigencesModalTemplate, { 
      size: 'lg', 
      centered: true, 
      scrollable: true 
    });

    modalRef.result.then(
      (result: any[]) => {
        if (result && result.length > 0) {
          this.addSelectedExigencesFromModal(result);
        }
      },
      (reason) => {
        console.log(`Modal dismissed with reason: ${reason}`);
      }
    );
  }

  isSelected(exigence: any): boolean {
    return this.selectedExigencesInModal.some(e => e.id === exigence.id);
  }

  toggleSelection(exigence: any): void {
    if (this.isSelected(exigence)) {
      this.selectedExigencesInModal = this.selectedExigencesInModal.filter(e => e.id !== exigence.id);
    } else {
      this.selectedExigencesInModal.push(exigence);
    }
  }

  isAlreadyEvaluated(exigenceId: number): boolean {
    return this.exigencesEvaluees.some(e => e.exigenceTechnique.id === exigenceId);
  }

  addSelectedExigencesFromModal(selectedExigences: any[]): void {
    const nouvellesExigencesAAjouter = selectedExigences
      .filter(exig => !this.isAlreadyEvaluated(exig.id))
      .map(exig => ({
        id: null,
        exigenceTechnique: {
          id: exig.id,
          nomExigence: exig.nomExigence
        },
        scoreCompetenceTech: 0
      }));

    if (nouvellesExigencesAAjouter.length > 0) {
      this.exigencesEvaluees = [...this.exigencesEvaluees, ...nouvellesExigencesAAjouter];
    }
  }

  removeExigence(index: number): void {
    this.exigencesEvaluees.splice(index, 1);
  }

  private removeDuplicateExigences(exigences: any[]): any[] {
    const uniqueExigences = [];
    const exigenceIds = new Set();

    exigences.forEach(exig => {
      if (!exigenceIds.has(exig.id)) {
        exigenceIds.add(exig.id);
        uniqueExigences.push(exig);
      }
    });

    return uniqueExigences;
  }

  private getScoreValue(level: number): number {
    return this.levelValues[level] || 0;
  }

  getLevelValue(level: number): number {
    return this.levelValues[level] || 0;
  }

  onScoreChange(exigenceItem: any, level: number): void {
    this.exigencesEvaluees = this.exigencesEvaluees.map(e => {
      if (e.exigenceTechnique.id === exigenceItem.exigenceTechnique.id) {
        return {
          ...e,
          scoreCompetenceTech: level,
          valeurScore: this.getScoreValue(level)
        };
      }
      return e;
    });
    this.cdr.detectChanges();
  }

  saveChanges(): void {
    if (!this.ficheTech || !this.ficheTech.id || !this.ficheEvalId) {
      this.toastr.error("Informations manquantes", "Erreur");
      return;
    }

    this.isLoading = true;
    
    const dtoList: ExigenceScoreDTO[] = this.exigencesEvaluees.map(e => ({
      exigenceId: e.exigenceTechnique.id,
      score: this.getScoreValue(e.scoreCompetenceTech)
    }));

    this.ficheEvalService.addOrUpdateExigencesTech(this.ficheEvalId, this.ficheTech.id, dtoList).subscribe(
      () => {
        this.toastr.success('Sauvegarde réussie!', 'Succès');
        this.ficheEvalService.notifyFicheUpdate();
        this.techUpdated.emit();
        this.isLoading = false;
      },
      (error) => {
        this.toastr.error('Erreur de sauvegarde', 'Erreur');
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    );
  }
}