// listcampagne.component.ts
import { Component, OnInit } from '@angular/core';
import { CampagneService } from '../campagne.service';
import { Campaign } from '../campaign.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listcampagne',
  templateUrl: './listcampagne.component.html',
  styleUrls: ['./listcampagne.component.css']
})
export class ListcampagneComponent implements OnInit {
  campaigns: Campaign[] = [];
  filteredCampaigns: Campaign[] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';
  currentSort: { key: string, direction: 'asc' | 'desc' } = { key: 'startDate', direction: 'desc' };
  public breadcrumb: any;

  statusFilters = [
    { value: 'PLANNED', label: 'Planifiée', checked: true },
    { value: 'ACTIVE', label: 'Active', checked: true },
    { value: 'COMPLETED', label: 'Terminée', checked: true }
  ];

  constructor(
    private campagneService: CampagneService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.breadcrumb = {
      'mainlabel': 'Liste des Campagnes de stage',
      'links': [
        {
          title: 'Liste des Campagnes',
          isLink: true,
          link: '/campaigns'
        }
      ]
    };

    this.loadCampaigns();
  }

  loadCampaigns() {
    this.isLoading = true;
    this.campagneService.getAllCampaigns().subscribe({
      next: (data) => {
        this.campaigns = data;
        this.filteredCampaigns = [...data];
        this.sortCampaigns(this.currentSort.key);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors du chargement des campagnes';
        this.isLoading = false;
      }
    });
  }

  sortCampaigns(key: string) {
    if (this.currentSort.key === key) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = { key, direction: 'asc' };
    }

    this.filteredCampaigns.sort((a, b) => {
      const valA = a[key as keyof Campaign];
      const valB = b[key as keyof Campaign];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.currentSort.direction === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      
      if (valA instanceof Date && valB instanceof Date) {
        return this.currentSort.direction === 'asc'
          ? valA.getTime() - valB.getTime()
          : valB.getTime() - valA.getTime();
      }
      
      return 0;
    });
  }

  updateFilters() {
    this.filteredCampaigns = this.campaigns.filter(campaign => 
      this.statusFilters.find(f => f.value === campaign.status)?.checked &&
      (campaign.academicYear?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       campaign.typeStage?.nomTypeStage?.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  deleteCampaign(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      this.campagneService.deleteCampaign(id).subscribe({
        next: () => this.loadCampaigns(),
        error: (err) => console.error('Erreur de suppression', err)
      });
    }
  }
  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Statut inconnu';
    
    const statusMap: Record<string, string> = {
      'PLANNED': 'Planifiée',
      'ACTIVE': 'Active',
      'COMPLETED': 'Terminée'
    };
    
    return statusMap[status.toUpperCase()] || status;
  }

  getStatusClass(status: string | undefined): string {
    const defaultClass = 'badge bg-primary';
    if (!status) return defaultClass;

    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'badge bg-success';
      case 'COMPLETED': return 'badge bg-secondary';
      default: return defaultClass;
    }
  }
}