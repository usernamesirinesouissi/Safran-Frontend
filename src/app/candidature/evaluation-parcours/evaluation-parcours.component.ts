import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs'; 
import { ToastrService } from 'ngx-toastr';
import { EvaluationService } from '../evaluation.service';
import { 
  CompetenceDTO, 
  EvaluationStage, 
  NiveauEvaluationDTO, 
  AddCompetenceRequest, 
  CompetenceDTOTech, 
  TypeEvaluation, 
  EvaluationCompetenceRHDTO, 
  EvaluationCompetenceTechDTO 
} from 'src/app/_api/_models/evaluation.model';
import { finalize, tap, catchError } from 'rxjs/operators';

interface EvaluationItem {
  competence: CompetenceDTO | CompetenceDTOTech;
  niveauId: number | null;
  isNew?: boolean;      
  isModified?: boolean;
  type: 'rh' | 'tech';
  evaluationItemId?: number;
}

@Component({
  selector: 'app-evaluation-parcours',
  templateUrl: './evaluation-parcours.component.html',
  styleUrls: ['./evaluation-parcours.component.css']
})
export class EvaluationParcoursComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  isModalOpen = false;
  evaluation: EvaluationStage | null = null;
  selectedForEvaluation: EvaluationItem[] = [];
  allRhCompetencies: CompetenceDTO[] = [];
  allTechCompetencies: CompetenceDTOTech[] = [];
  allNiveaux: NiveauEvaluationDTO[] = [];
  availableCompetenciesInModal: (CompetenceDTO | CompetenceDTOTech)[] = [];
  tempSelectedInModal = new Set<CompetenceDTO | CompetenceDTOTech>();
  showTechCompetencies = false;

  allTypesEvaluation: TypeEvaluation[] = [];
  selectedType: TypeEvaluation | null = null;
  isDropdownOpen = false;
  
  // Nouveaux champs pour gérer les évaluations multiples
  evaluationsMap = new Map<number, EvaluationStage>();
  completionMap = new Map<number, number>();
  candidatureId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private evaluationService: EvaluationService,
    private toastr: ToastrService
  ) { }

 ngOnInit(): void {
    this.candidatureId = Number(this.route.snapshot.paramMap.get('candidatureId'));
    if (!this.candidatureId) {
      this.toastr.error("ID de candidature manquant.", "Erreur");
      return;
    }
    
    forkJoin({
      evaluations: this.evaluationService.getAllEvaluationsForCandidature(this.candidatureId),
      allRh: this.evaluationService.getAllRhCompetencies(), 
      allTech: this.evaluationService.getAllTechCompetencies(),
      allNiveaux: this.evaluationService.getAllNiveaux(),
      types: this.evaluationService.getAllTypesEvaluation().pipe(
        catchError((error) => {
          console.error('Erreur lors du chargement des types:', error);
          this.toastr.warning('Impossible de charger les types d\'évaluation');
          return of([]);
        })
      )
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ({ evaluations, allRh, allTech, allNiveaux, types }) => {
        // CORRECTION : Renommer 'eval' en 'evaluationItem'
        evaluations.forEach(evaluationItem => {
          if (evaluationItem.typeEvaluation) {
            this.evaluationsMap.set(evaluationItem.typeEvaluation.id, evaluationItem);
            const completion = this.calculateCompletionPercentage(evaluationItem);
            this.completionMap.set(evaluationItem.typeEvaluation.id, completion);
          }
        });

        this.allRhCompetencies = allRh;
        this.allTechCompetencies = allTech as unknown as CompetenceDTOTech[];
        this.allNiveaux = allNiveaux;
        this.allTypesEvaluation = types;

        // Sélectionner le premier type par défaut
        if (this.allTypesEvaluation.length > 0) {
          this.selectedType = this.allTypesEvaluation[0];
          this.loadEvaluationForType(this.selectedType);
        }
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
        this.toastr.error(err.error?.message || "Erreur de chargement de la fiche d'évaluation.", "Erreur");
      }
    });
  }

  // Fonction pour calculer le pourcentage de complétion
  private calculateCompletionPercentage(evaluation: EvaluationStage): number {
    // Logique simulée - à remplacer par un vrai calcul
    return Math.floor(Math.random() * 100);
  }

  // Charger l'évaluation pour un type donné
  loadEvaluationForType(type: TypeEvaluation): void {
    if (!this.candidatureId) return;

    if (this.evaluationsMap.has(type.id)) {
      this.evaluation = this.evaluationsMap.get(type.id)!;
      this.loadExistingCompetences();
    } else {
      this.evaluationService.getOrCreateEvaluationForCandidatureAndType(
        this.candidatureId, 
        type.id
      ).subscribe({
        next: evaluationStage => {
          this.evaluation = evaluationStage;
          this.evaluationsMap.set(type.id, evaluationStage);
          this.completionMap.set(type.id, 0);
          this.selectedForEvaluation = [];
          this.toastr.info(`Nouvelle évaluation créée pour le type: ${type.nomTypeEval}`);
        },
        error: (err) => {
          this.toastr.error("Erreur lors de la création de l'évaluation");
        }
      });
    }
  }

  // Obtenir l'icône de complétion pour un type
  getCompletionIcon(typeId: number): string {
    const percentage = this.completionMap.get(typeId) || 0;
    if (percentage === 100) return '✓';
    if (percentage > 0) return '●';
    return '';
  }

  // Sélectionner un type d'évaluation
  selectEvaluationType(type: TypeEvaluation): void {
    this.selectedType = type;
    this.isDropdownOpen = false;
    this.loadEvaluationForType(type);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getSelectedTypeName(): string {
    if (this.selectedType) return this.selectedType.nomTypeEval;
    if (this.allTypesEvaluation?.length > 0) return "Sélectionnez un type";
    return "Chargement des types...";
  }

  trackByTypeId(index: number, type: TypeEvaluation): number {
    return type.id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isDropdownOpen = false;
    }
  }

  openAddCompetenceModal(): void {
    this.showTechCompetencies = false; 
    this.tempSelectedInModal.clear();
    this.updateAvailableCompetencies();
    this.isModalOpen = true;
  }

  updateAvailableCompetencies(): void {
    const sourceCompetencies = this.showTechCompetencies 
      ? this.allTechCompetencies 
      : this.allRhCompetencies;

    const selectedIds = new Set(this.selectedForEvaluation.map(item => item.competence.id));
    
    this.availableCompetenciesInModal = (sourceCompetencies as (CompetenceDTO | CompetenceDTOTech)[]).filter(
      comp => !selectedIds.has(comp.id)
    );
  }

  selectCompetenceType(isTech: boolean): void {
    if (this.showTechCompetencies === isTech) return; 
    this.showTechCompetencies = isTech;
    this.tempSelectedInModal.clear();
    this.updateAvailableCompetencies();
  }
  
  closeAddCompetenceModal(): void {
    this.isModalOpen = false;
  }

  toggleSelectionInModal(competence: CompetenceDTO | CompetenceDTOTech, event: any): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.tempSelectedInModal.add(competence);
    } else {
      this.tempSelectedInModal.delete(competence);
    }
  }

  addSelectedFromModal(): void {
    const newItems: EvaluationItem[] = Array.from(this.tempSelectedInModal).map(comp => ({
      competence: comp,
      niveauId: null,
      isNew: true,
      type: this.showTechCompetencies ? 'tech' : 'rh'
    }));

    this.selectedForEvaluation = [...this.selectedForEvaluation, ...newItems];
    this.closeAddCompetenceModal();
  }

  removeCompetenceFromList(competenceId: number): void {
    const itemIndex = this.selectedForEvaluation.findIndex(item => item.competence.id === competenceId);
    
    if (itemIndex !== -1) {
      const item = this.selectedForEvaluation[itemIndex];
      
      if (item.evaluationItemId) {
        // Item existant: marquer pour suppression
        item.niveauId = null;
        item.isModified = true;
      } else {
        // Nouvel item: retirer directement
        this.selectedForEvaluation.splice(itemIndex, 1);
      }
    }
  }

  selectLevelForCompetence(item: EvaluationItem, levelId: number): void {
    if (item.niveauId !== levelId) {
      item.niveauId = levelId;
      item.isModified = true;
    }
  }

  isSaveEnabled(): boolean {
    const typeChanged = this.selectedType?.id !== this.evaluation?.typeEvaluation?.id;
    const hasChanges = this.selectedForEvaluation.some(
      item => item.isNew || item.isModified
    );
    return typeChanged || hasChanges;
  }

  saveEvaluation(): void {
    if (!this.evaluation || !this.candidatureId) {
      this.toastr.error("Évaluation introuvable", "Erreur");
      return;
    }

    this.isSaving = true;

    if (this.selectedType && this.selectedType.id !== this.evaluation.typeEvaluation?.id) {
      this.saveEvaluationType().subscribe({
        next: () => this.saveCompetences(),
        error: () => this.isSaving = false
      });
    } else {
      this.saveCompetences();
    }
  }

  private saveEvaluationType(): Observable<any> {
    return this.evaluationService.setEvaluationType(
      this.evaluation!.id, 
      this.selectedType!.id
    ).pipe(
      tap(() => {
        if (this.evaluation) {
          this.evaluation.typeEvaluation = this.selectedType!;
          this.completionMap.set(this.selectedType!.id, 0);
        }
        this.toastr.success('Type d\'évaluation mis à jour');
      }),
      catchError(err => {
        this.toastr.error('Erreur mise à jour type: ' + err.error?.message);
        throw err;
      })
    );
  }

  private saveCompetences(): void {
    const requests: Observable<any>[] = [];

    this.selectedForEvaluation.forEach(item => {
      if (item.isNew && item.niveauId) {
        const request: AddCompetenceRequest = {
          competenceId: item.competence.id,
          niveauId: item.niveauId
        };
        
        const saveRequest = item.type === 'rh'
          ? this.evaluationService.addRhCompetenceToEvaluation(this.evaluation!.id, request)
          : this.evaluationService.addTechCompetenceToEvaluation(this.evaluation!.id, request);
        
        requests.push(saveRequest.pipe(
          tap(() => {
            item.isNew = false;
            item.isModified = false;
          })
        ));
      }
      else if (item.isModified && item.evaluationItemId) {
        if (item.niveauId) {
          const updateRequest = {
            niveauId: item.niveauId
          };
          
          const saveRequest = item.type === 'rh'
            ? this.evaluationService.updateRhCompetenceForEvaluation(
                this.evaluation!.id, 
                item.competence.id, 
                updateRequest
              )
            : this.evaluationService.updateTechCompetenceForEvaluation(
                this.evaluation!.id, 
                item.competence.id, 
                updateRequest
              );
          
          requests.push(saveRequest.pipe(
            tap(() => {
              item.isModified = false;
            })
          ));
        } 
      }
    });

    if (requests.length === 0) {
      this.isSaving = false;
      this.toastr.info("Aucun changement à sauvegarder");
      return;
    }

    forkJoin(requests).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: () => {
        this.toastr.success("Évaluation sauvegardée avec succès");
        this.loadExistingCompetences();
        // Mettre à jour le pourcentage de complétion
        if (this.evaluation?.typeEvaluation) {
          this.completionMap.set(
            this.evaluation.typeEvaluation.id, 
            this.getCompletionPercentage()
          );
        }
      },
      error: (err) => {
        this.toastr.error("Erreur de sauvegarde: " + (err.error?.message || err.message));
      }
    });
  }

  private loadExistingCompetences(): void {
    if (!this.evaluation?.id) return;

    forkJoin({
      rhCompetences: this.evaluationService.getEvaluatedRhCompetencies(this.evaluation.id),
      techCompetences: this.evaluationService.getEvaluatedTechCompetencies(this.evaluation.id)
    }).subscribe({
      next: ({ rhCompetences, techCompetences }) => {
        const rhItems: EvaluationItem[] = rhCompetences.map(compEvaluee => ({
          competence: compEvaluee.competence,
          niveauId: compEvaluee.niveau?.id ?? null,
          type: 'rh',
          evaluationItemId: compEvaluee.id
        }));
        
        const techItems: EvaluationItem[] = techCompetences.map(compEvaluee => ({
          competence: compEvaluee.competence,
          niveauId: compEvaluee.niveau?.id ?? null,
          type: 'tech',
          evaluationItemId: compEvaluee.id
        }));
        
        this.selectedForEvaluation = [...rhItems, ...techItems];
      },
      error: (err) => {
        console.error("Erreur lors du chargement des compétences existantes:", err);
        this.toastr.warning("Impossible de charger les compétences évaluées", "Attention");
      }
    });
  }

  getCompletionPercentage(): number {
    if (this.selectedForEvaluation.length === 0) return 0;
    const completed = this.selectedForEvaluation.filter(item => item.niveauId !== null).length;
    return Math.round((completed / this.selectedForEvaluation.length) * 100);
  }

  getCompetenceName(competence: CompetenceDTO | CompetenceDTOTech): string {
    if ('nomCompetence' in competence) return competence.nomCompetence;
    if ('nomExigence' in competence) return competence.nomExigence;
    return 'Compétence sans nom';
  }

  trackByCompetence(index: number, item: EvaluationItem): number {
    return item.competence.id;
  }
}