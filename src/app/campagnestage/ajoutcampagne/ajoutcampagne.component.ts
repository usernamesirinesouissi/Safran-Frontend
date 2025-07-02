import { Component, OnInit } from '@angular/core';
import { CampagneService } from '../campagne.service';
import { Campaign } from '../campaign.model';
import { Router } from '@angular/router';
import { TypeStage } from 'src/app/demandestage/demande.model';

@Component({
  selector: 'app-ajoutcampagne',
  templateUrl: './ajoutcampagne.component.html',
  styleUrls: ['./ajoutcampagne.component.css']
})
export class AjoutcampagneComponent implements OnInit {
  campaign: any = {
    typeStage: null,
    startDate: '',
    endDate: '',
    academicYear: ''
  };
  selectedTypeStageId: number | null = null;

  public breadcrumb: any;
  typeStages: TypeStage[] = [];

  minStartDate: string;
  minEndDate: string;

  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(
    private campagneService: CampagneService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const today = new Date();
    this.minStartDate = today.toISOString().split('T')[0];
    this.minEndDate = this.minStartDate;

    this.breadcrumb = {
      'mainlabel': 'Formulaire Ajout Campagne de stage',
      'links': [
        {
          title: 'Liste des Campagnes',
          isLink: true,
          link: '#'
        },
        {
          title: 'Ajout Campagne',
          isLink: false
        },
      ]
    };

    this.campagneService.getAllStages().subscribe({
      next: (data) => this.typeStages = data,
      error: (err) => console.error('Erreur lors du chargement des types de stage', err)
    });
  }

  onSubmit() {
    this.errorMessage = null;
    this.isSubmitting = true;

    const currentDate = new Date();
    const startDate = new Date(this.campaign.startDate);
    const endDate = new Date(this.campaign.endDate);

    let status = 'PLANNED';
    if (currentDate >= startDate && currentDate <= endDate) {
      status = 'ACTIVE';
    }

    const payload = {
      typeStage: { id: this.selectedTypeStageId },
      startDate: this.formatDate(this.campaign.startDate),
      endDate: this.formatDate(this.campaign.endDate),
      academicYear: this.campaign.academicYear,
      status: status
    };

    this.campagneService.createCampaign(payload).subscribe({
      next: (response) => {
        console.log('Campagne créée:', response);
        this.router.navigate(['/campagnes/liste']);
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        this.errorMessage = this.extractErrorMessage(err);
        this.isSubmitting = false;
      },
      complete: () => this.isSubmitting = false
    });
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  validateDates() {
    if (this.campaign.startDate) {
      this.minEndDate = this.campaign.startDate;
      
      if (new Date(this.campaign.endDate) < new Date(this.campaign.startDate)) {
        this.campaign.endDate = this.campaign.startDate;
      }
    }
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.message) {
      return err.error.message;
    }
    if (err.status === 400) {
      return 'Données invalides. Vérifiez les champs saisis.';
    }
    return 'Erreur inconnue lors de la création';
  }

  get maxStartDate(): string {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  }// Nouvelle méthode pour prévisualiser le statut
  getPreviewStatus(): string {
    if (!this.campaign.startDate || !this.campaign.endDate) return "Non défini"

    const currentDate = new Date()
    const startDate = new Date(this.campaign.startDate)
    const endDate = new Date(this.campaign.endDate)

    if (currentDate < startDate) return "Planifiée"
    if (currentDate >= startDate && currentDate <= endDate) return "Active"
    return "Terminée"
  }

  // Nouvelle méthode pour calculer la durée
  calculateDuration(): number {
    if (!this.campaign.startDate || !this.campaign.endDate) return 0

    const startDate = new Date(this.campaign.startDate)
    const endDate = new Date(this.campaign.endDate)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}