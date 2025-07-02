import { Component, OnInit } from '@angular/core';
import { CandidatureService } from '../candidature.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandeService } from 'src/app/demandestage/demande.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-detailcandidature',
  templateUrl: './detailcandidature.component.html',
  styleUrls: ['./detailcandidature.component.css']
})
export class DetailcandidatureComponent implements OnInit {
  candidat: any;
  candidatures: any[] = [];
  autresSujets: any[] = [];
  showModal = false;
  showAutresSujets = false;
  entretiensForCandidat: any[] = [];

  entretienForm: FormGroup;
  candidatImage: string = '../../../assets/images/portrait/small/avatar-s-9.png';

  showFicheEvalModal = false;
  selectedEntretienIdForEval: number | null = null;
 
  constructor( private fb: FormBuilder, private candidatService: CandidatureService,
    private route: ActivatedRoute, private demandeService: DemandeService,private toastr: ToastrService) { }

    ngOnInit(): void {
      this.entretienForm = this.fb.group({
        dateHeure: ['', Validators.required],
        duree: [30, Validators.required],
        lieu: ['', Validators.required],
        candidatureId: ['', Validators.required],
        autreSujetId: [''],
        commentaires: ['']
      });
  
      const candidatId = +this.route.snapshot.paramMap.get('id');
  
      this.candidatService.getCandidatById(candidatId).subscribe(candidat => {
        this.loadCandidateImage(candidat.photoPath);
        this.candidat = candidat;
      });
  
      this.candidatService.getCandidaturesByCandidatId(candidatId).subscribe(data => {
        this.candidatures = data; 
        this.candidat.candidatures = data; 
      });
  
      this.demandeService.getSujets().subscribe(data => {
        this.autresSujets = data;
      });

      this.loadEntretiensForCandidat(candidatId);
    }

    isEntretienPlanned(candidatureId: number): boolean {
      if (!this.entretiensForCandidat) return false;
    
      return this.entretiensForCandidat.some(entretien =>
        entretien.candidature && entretien.candidature.id === candidatureId
      );
    }
    
      openFicheEvalModal(entretienId: number): void {
    this.selectedEntretienIdForEval = entretienId;
    this.showFicheEvalModal = true;
  }

  closeFicheEvalModal(): void {
    this.showFicheEvalModal = false;
    this.selectedEntretienIdForEval = null;
    // Optionnel: rafraîchir les données si une évaluation a pu changer des statuts
    // this.loadEntretiensForCandidat(this.candidat.id);
  }


  loadCandidateImage(photoPath: string): void {
    if (!photoPath) return;
  
    const imageName = photoPath.split('\\').pop()?.split('/').pop();
    if (!imageName) return;
  
    this.candidatService.getImageBase64(imageName).subscribe(
      (base64: string) => {
        this.candidatImage = base64;
      },
      () => {
        this.candidatImage = '../../../assets/images/portrait/small/avatar-s-9.png';
      }
    );
  }
  
  getScoreColor(score: number): string {
    if (score < 5) return '#dc2626';  
    if (score < 20) return '#FE4A49';     
    if (score < 50) return '#f59e0b';      
    if (score < 90) return '#4ade80';    
    return '#16a34a';                     
  }
  getSafeCvUrl(cvPath: string): string {

    return cvPath; 
  }

  toggleAutresSujets(): void {
    this.showAutresSujets = !this.showAutresSujets;
  }

  closeEntretienModal(): void {
    this.showModal = false;
    this.entretienForm.reset();
  }

  submitEntretien(): void {
    if (this.entretienForm.invalid) {
      console.warn('Formulaire invalide:', this.entretienForm.value);
      return;
    }
  
    const formData = this.entretienForm.value;
  
    // Ensure dateHeure includes seconds (appends ':00' if missing)
    if (formData.dateHeure) {
      formData.dateHeure = formData.dateHeure + ':00'; // Add seconds if missing
    }
  
    console.log('Formulaire valide, données soumises:', formData);
  
    const candidatId = +this.route.snapshot.paramMap.get('id');
  
    // Si un autre sujet est choisi, créer une candidature avant l’entretien
    if (formData.autreSujetId && formData.autreSujetId !== '') {
      console.log('Création d\'une nouvelle candidature à partir d\'un autre sujet...');
      this.candidatService.createCandidatureWithScore(candidatId, formData.autreSujetId).subscribe({
        next: (createdCandidature) => {
          console.log('Nouvelle candidature créée:', createdCandidature);
          this.createEntretienWithCandidature(createdCandidature.id, formData);
          this.toastr.success('Entretien planifié avec succès!', 'Succès');
          window.location.reload(); // Refresh the page after successful entretien creation
        },
        error: (err) => {
          console.error('Erreur création candidature:', err);
          this.toastr.error('Une erreur est survenue lors de la création de la candidature.', 'Erreur');
        }
      });
    } else {
      console.log('Création entretien avec candidature existante:', formData.candidatureId);
      this.createEntretienWithCandidature(formData.candidatureId, formData);
      this.toastr.success('Entretien planifié avec succès!', 'Succès');
      window.location.reload(); 
    }
  }
  
  
  
  
  
  openEntretienModal(): void {
    this.showModal = true;
  }
  createEntretienWithCandidature(candidatureId: number, formData: any): void {
    const entretienPayload = {
      dateHeure: formData.dateHeure,
      dureeEnMinutes: formData.duree,
      lieu: formData.lieu,
      commentaires: formData.commentaires,
      candidature: { id: candidatureId }
    };
  
    console.log('Payload envoyé pour créer l\'entretien:', entretienPayload);
  
    this.candidatService.createEntretien(entretienPayload).subscribe({
      next: (entretien) => {
        console.log('Entretien créé avec succès:', entretien);
      },
      error: (err) => {
        console.error('Erreur création entretien:', err);
      }
    });
  }
  
    loadEntretiensForCandidat(candidatId: number) {
    this.candidatService.loadEntretiens(candidatId).subscribe(
      data => {
        this.entretiensForCandidat = data;
        // Si un entretien existe, on peut vouloir pré-sélectionner son ID pour le form d'entretien
        if (this.entretienForm && data.length > 0 && !this.entretienForm.get('candidatureId')?.value) {
           // Trouver la candidature associée au premier entretien (si pertinent pour votre logique)
           const candidatureAssociee = this.candidatures.find(c => c.id === data[0].candidature.id);
           if (candidatureAssociee) {
             this.entretienForm.patchValue({ candidatureId: candidatureAssociee.id });
           }
        }
      },
      error => {
        this.toastr.error("Erreur lors du chargement des entretiens du candidat.", "Erreur");
        console.error(error);
      }
    );
  }
  
  
}
