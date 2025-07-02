import { Component, OnInit } from '@angular/core';
import { CandidatureService } from '../candidature.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
export interface Stagiaire {
  id: number;
  nom: string;
  role: string;
  photoUrl: string;
  localisation: string;
  typeContrat: 'Temps plein' | 'Temps partiel' | 'Freelance' | 'Stage'; // Or 'Apprentissage'
  tauxHoraire?: number; // Optional, as internships might not always show this
  competences: string[];
  estFavori?: boolean; // For the heart icon
  
}
@Component({
  selector: 'app-listestagiaires',
  templateUrl: './listestagiaires.component.html',
  styleUrls: ['./listestagiaires.component.css']
})
export class ListestagiairesComponent implements OnInit {
   stagiaires: any[] = [];
  filteredStagiaires: any[] = [];
  breadcrumb: any;

  searchTerm: string = '';
  selectedLocation: string = '';
  selectedRole: string = '';
  selectedDate: string = '';

  availableRoles: string[] = [];
  availableLocations: string[] = [];

  isLoading: boolean = true;
  errorLoading: string | null = null;

  defaultAvatar = 'assets/images/default-avatar.png'; // Define default avatar path

  constructor(
    private http: HttpClient, // Can remove if CandidatureService handles ALL http calls
    private candidatureService: CandidatureService,
    private router: Router 
  ) { }

  ngOnInit(): void {
    this.breadcrumb = {
      'mainlabel': 'Liste des Stagiaires Acceptés',
      'links': [
        { 'name': 'Dashboard', 'isLink': true, 'link': '/dashboard/sales' },
        { 'name': 'Liste Stagiaires', 'isLink': false, 'link': '#' }
      ]
    };
    this.loadStagiairesWithStatutAffecte();
  }

  /*loadStagiairesWithStatut4(): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.candidatureService.getAccepte().subscribe(
      (backendCandidatures: any[]) => {
        this.stagiaires = backendCandidatures.map(bc => this.mapBackendToStagiaireView(bc));
        this.filteredStagiaires = [...this.stagiaires];
        this.populateFilterOptions();
        this.loadImagesForStagiaires(); // Call to load images
        // Note: isLoading could be set to false after images are loaded or partially loaded
      },
      (error) => {
        console.error('Error fetching candidatures:', error);
        this.errorLoading = 'Erreur lors du chargement des données. Veuillez réessayer.';
        this.isLoading = false;
      }
    );
  }*/

  mapBackendToStagiaireView(bc: any): any {
    const nomComplet = `${bc.candidat?.prenomCandidat || ''} ${bc.candidat?.nomCandidat || ''}`.trim() || 'N/A';

    return {
      
      id: bc.candidat.id, 
      nom: nomComplet,
      role: bc.demande?.intituleProjet || 'Rôle non spécifié',
      // Initially, photoUrl is the path/filename from backend, or default if none
      photoUrl: bc.candidat?.photoPath ? bc.candidat.photoPath : this.defaultAvatar,
      originalPhotoPath: bc.candidat?.photoPath, // Store the original path to fetch the image
      localisation: bc.candidat?.localisation || bc.demande?.localisation || 'Lieu non spécifié',
      typeContrat: bc.demande?.typeStage?.nomTypeStage,

      estFavori: false
    };
  }

  loadImagesForStagiaires(): void {
    const imageLoadObservables: Observable<any>[] = [];

    this.stagiaires.forEach(stagiaire => {
      if (stagiaire.originalPhotoPath && stagiaire.originalPhotoPath !== this.defaultAvatar) {
        const imageName = stagiaire.originalPhotoPath.split('\\').pop()?.split('/').pop();
        if (imageName) {
          const obs = this.candidatureService.getImageBase64(imageName).pipe(
            map(base64String => {
              stagiaire.photoUrl = base64String; // Update photoUrl with base64
              return stagiaire; // Not strictly needed for forkJoin but good practice
            }),
            catchError(err => {
              console.warn(`Failed to load image ${imageName}:`, err);
              stagiaire.photoUrl = this.defaultAvatar; // Fallback to default on error
              return of(stagiaire); // Return an observable so forkJoin doesn't break
            })
          );
          imageLoadObservables.push(obs);
        } else {
            stagiaire.photoUrl = this.defaultAvatar; // If imageName can't be extracted
        }
      } else {
        // If no originalPhotoPath or it's already the default, ensure photoUrl is default
        stagiaire.photoUrl = this.defaultAvatar;
      }
    });

    if (imageLoadObservables.length > 0) {
      forkJoin(imageLoadObservables).subscribe({
        complete: () => {
          // All images (or attempts) are done. Refresh filtered list if necessary.
          this.filteredStagiaires = [...this.stagiaires];
          this.isLoading = false; // Set loading to false after images are processed
          console.log('All images processed.');
        },
        error: (err) => {
            // This error block in forkJoin might not be hit often if individual errors are caught by catchError
            console.error('Error in forkJoin for image loading:', err);
            this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false; // No images to load, set loading to false
    }
  }

  viewProfile(stagiaire: any): void {
    console.log('Voir profil du candidat ID:', stagiaire.id); 
    this.router.navigate(['/candidature/detailstagiaires', stagiaire.id]);
  }
  populateFilterOptions(): void {
    const roles = new Set<string>();
    const locations = new Set<string>();
    this.stagiaires.forEach(s => {
      if (s.role) roles.add(s.role);
      if (s.localisation) locations.add(s.localisation);
    });
    this.availableRoles = Array.from(roles).sort();
    this.availableLocations = Array.from(locations).sort();
  }

  applyFilters(): void {
    let tempStagiaires = [...this.stagiaires];
    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      tempStagiaires = tempStagiaires.filter(s =>
        (s.nom && s.nom.toLowerCase().includes(lowerSearchTerm)) ||
        (s.role && s.role.toLowerCase().includes(lowerSearchTerm)) ||
        (s.competences && s.competences.some((c: string) => c.toLowerCase().includes(lowerSearchTerm)))
      );
    }
    if (this.selectedLocation) {
      tempStagiaires = tempStagiaires.filter(s => s.localisation === this.selectedLocation);
    }
    if (this.selectedRole) {
      tempStagiaires = tempStagiaires.filter(s => s.role === this.selectedRole);
    }
    this.filteredStagiaires = tempStagiaires;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedLocation = '';
    this.selectedRole = '';
    this.selectedDate = '';
    this.filteredStagiaires = [...this.stagiaires];
  }

  toggleFavori(stagiaire: any): void {
    stagiaire.estFavori = !stagiaire.estFavori;
  }



  getTagClass(typeContrat: any): string {
    switch (typeContrat) {
      case 'Temps plein': return 'tag-temps-plein';
      case 'Temps partiel': return 'tag-temps-partiel';
      case 'Stage': return 'tag-stage';
      case 'Freelance': return 'tag-freelance';
      default: return 'tag-default';
    }
  }


  loadStagiairesWithStatutAffecte(): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.candidatureService.getAccepte().subscribe(
      (backendCandidatures: any[]) => {
        this.stagiaires = backendCandidatures.map(bc => this.mapBackendToStagiaireView(bc));
        this.filteredStagiaires = [...this.stagiaires];
        this.populateFilterOptions();
        this.loadImagesForStagiaires();
      },
      (error) => {
        console.error('Error fetching candidatures:', error);
        this.errorLoading = 'Erreur lors du chargement des données. Veuillez réessayer.';
        this.isLoading = false;
      }
    );
  }
 

 

}