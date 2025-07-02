// src/app/candidature/components/fiche-eval-globale/fiche-eval-globale.component.ts
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FicheEvalService } from '../../services/fiche-eval.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-fiche-eval-globale',
  templateUrl: './fiche-eval-globale.component.html',
  styleUrls: ['./fiche-eval-globale.component.css']
})
export class FicheEvalGlobaleComponent implements OnInit, OnChanges {
  @Input() entretienId: number; // Sera passé par le composant parent (page ou modal)
  ficheEval: any = null;
  activeTab: 'global' | 'rh' | 'tech' = 'global';
  isLoading = true;
    breadcrumb: any;


  constructor(private ficheEvalService: FicheEvalService, private toastr: ToastrService,  private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.entretienId) {
      this.loadFicheEvaluation();
    } else {
        this.isLoading = false; // Pas d'ID, rien à charger
        console.warn("FicheEvalGlobaleComponent: entretienId non fourni à l'initialisation.");
    }


      this.ficheEvalService.ficheUpdated$.subscribe(() => {
    if (this.entretienId) {
      this.loadFicheEvaluation();
    }
  });

  this.breadcrumb = {
      'mainlabel': 'Fiche ',
      'links': [
        {
          'name': 'Dashbaord',
          'isLink': true,
          'link': '/dashboard/sales'
        },
        
        {
          'name': 'candidatures',
          'isLink': false,
          'link': '#'
        }
     ]
    };
    
  }

getBadgeClassForGlobalStatut(): string {
    const globalStatut = this.ficheEval?.statutGlobal?.nomStatut?.toLowerCase() || '';
    
    if (globalStatut.includes('retenu rh et technique')) {
        return 'badge bg-success';
    } else if (globalStatut.includes('retenu rh non retenu technique')) {
        return 'badge bg-warning text-dark';
    } else if (globalStatut.includes('non retenu rh et retenu technique')) {
        return 'badge bg-warning text-dark';
    } else if (globalStatut.includes('non retenu rh et non retenu technique')) {
        return 'badge bg-danger';
    }
    
    return 'badge bg-secondary';
}

getGlobalStatut(): string {
    return this.ficheEval?.statutGlobal?.nomStatut || 'Non défini';
}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.entretienId && changes.entretienId.currentValue && changes.entretienId.currentValue !== changes.entretienId.previousValue) {
      this.loadFicheEvaluation();
    }
  }

  loadFicheEvaluation(): void {
    if (!this.entretienId) {
        this.toastr.error("ID d'entretien manquant pour charger la fiche.");
        this.isLoading = false;
        this.ficheEval = null; // Reset fiche if ID is missing
        return;
    }
    this.isLoading = true;
    this.ficheEvalService.getFicheEvalByEntretienId(this.entretienId).subscribe(
      data => {
        this.ficheEval = data;
        // Initialiser les fiches internes si elles sont nulles (cas d'une nouvelle fiche d'entretien)
        if (this.ficheEval && !this.ficheEval.ficheRh) {
            this.ficheEval.ficheRh = { id: null, competences: [], scoreTotalRh: 0, statut: null };
        }
        if (this.ficheEval && !this.ficheEval.ficheTech) {
            this.ficheEval.ficheTech = { id: null, competences: [], scoreTotalTech: 0, statut: null };
        }
        this.isLoading = false;
      },
      error => {
        this.toastr.error("Erreur lors du chargement de la fiche d'évaluation.", "Erreur");
        console.error(error);
        this.ficheEval = null; // Reset fiche on error
        this.isLoading = false;
      }
    );
  }

  changeTab(tab: 'global' | 'rh' | 'tech'): void {
    this.activeTab = tab;
  }

 

  getScoreColor(score: number | null | undefined): string {
    if (score === null || score === undefined) return '#6c757d'; // Gris (Bootstrap secondary)
    if (score < 3) return '#dc3545'; // Rouge (Bootstrap danger)
    if (score < 5) return '#fd7e14'; // Orange (Bootstrap orange)
    if (score < 7) return '#ffc107'; // Jaune (Bootstrap warning)
    if (score < 9) return '#198754'; // Vert (Bootstrap success)
    return '#0d6efd';                // Bleu (Bootstrap primary)
  }

  getBadgeClassForStatut(statut?: any): string {
    const statutName = statut?.nomStatut || 'Non défini';
    switch (statutName.toLowerCase()) {
      case 'en attente': return 'badge bg-warning text-dark';
      case 'en cours': return 'badge bg-info text-dark';
      case 'terminé':
      case 'validé':
      case 'terminee': // Si votre backend renvoie ça
        return 'badge bg-success';
      case 'rejeté': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }


recalculateTotalScore(): void {
  if (!this.ficheEval) return;

  const scoreRh = this.ficheEval.ficheRh?.scoreTotalRh || 0;
  const scoreTech = this.ficheEval.ficheTech?.scoreTotalTech || 0;
  
  this.ficheEval.scoreTotal = (scoreRh + scoreTech) / 2;
  
  this.updateGlobalStatus();
  
  this.cdr.detectChanges();
}

updateGlobalStatus(): void {
  if (!this.ficheEval || !this.ficheEval.ficheRh || !this.ficheEval.ficheTech) return;

 
}

handleFichePartUpdated(): void {
  console.log("Début de handleFichePartUpdated");
  
  // Recalcul local immédiat pour l'UI
  this.recalculateTotalScore();
  
  if (this.ficheEval?.id) {
    console.log("Appel au service pour mise à jour backend");
    this.ficheEvalService.updateFicheScore(this.ficheEval.id).subscribe(
      (updatedFiche) => {
        console.log("Réponse du backend:", updatedFiche);
        this.ficheEval.scoreTotal = updatedFiche.scoreTotal;
        this.ficheEval.ficheRh.scoreTotalRh = updatedFiche.ficheRh?.scoreTotalRh;
        this.ficheEval.ficheTech.scoreTotalTech = updatedFiche.ficheTech?.scoreTotalTech;
        this.toastr.success("Scores mis à jour avec succès");
      },
      (error) => {
        console.error("Erreur backend:", error);
        this.toastr.error("Erreur lors de la mise à jour des scores");
      }
    );
  } else {
    console.warn("ID de fiche non disponible pour la mise à jour");
  }
}




}