import { Component, EventEmitter, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PerfectScrollbarComponent, PerfectScrollbarConfigInterface, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { CandidatureService } from '../candidature.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DemandeService } from 'src/app/demandestage/demande.service';
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'app-listecandidature',
  templateUrl: './listecandidature.component.html',
  styleUrls: ['./listecandidature.component.css']
})
export class ListecandidatureComponent implements OnInit {
  breadcrumb: any;
  currentPage = 1;
  itemsPerPage = 10;
  showModal = false;
  entretienForm: FormGroup;
  candidatures: any[] = [];
  showAutresSujets = false;
  groupedCandidatures: any[] = [];
  autresSujets: any[] = [];
  constructor(private candidatureService: CandidatureService , private toastr: ToastrService,private candidatService: CandidatureService,private demandeService: DemandeService,private fb: FormBuilder,private route: ActivatedRoute,) { }

  ngOnInit(): void {
      this.entretienForm = this.fb.group({
            dateHeure: ['', Validators.required],
            duree: [30, Validators.required],
            lieu: ['', Validators.required],
            candidatureId: ['', Validators.required],
            autreSujetId: [''],
            commentaires: ['']
          });
    this.breadcrumb = {
      'mainlabel': 'Suivi des candidatures',
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
    this.demandeService.getSujets().subscribe(data => {
      this.autresSujets = data;
    });
    this.loadCandidatures();
  }
  openEntretienModal(): void {
    this.showModal = true;
  }
  toggleAutresSujets(): void {
    this.showAutresSujets = !this.showAutresSujets;
  }
  closeEntretienModal(): void {
    this.showModal = false;
    this.entretienForm.reset();
  }
  loadCandidatures(): void {
    this.candidatureService.getAll().subscribe((data) => {
      const map = new Map<number, any[]>();
  
      data.forEach((c: any) => {
        const id = c.candidat.id;
        const imageName = c.candidat.photoPath?.split('\\').pop()?.split('/').pop();
  
        if (!map.has(id)) map.set(id, []);
        map.get(id)!.push({ ...c, imageName, isFavorite: false });
      });
  
      this.groupedCandidatures = Array.from(map.entries()).map(([candidatId, candidatures]) => {
        return {
          candidat: candidatures[0].candidat,
          imageName: candidatures[0].imageName,
          candidatures
        };
      });
  
      // Load photo images
      this.groupedCandidatures.forEach(group => {
        if (group.imageName) {
          this.candidatureService.getImageBase64(group.imageName).subscribe((base64: string) => {
            group.image = base64;
          }, () => {
            group.image = '../../../assets/images/portrait/small/avatar-s-9.png';
          });
        } else {
          group.image = '../../../assets/images/portrait/small/avatar-s-9.png';
        }
      });
    });
  }
  getScoreColor(score: number): string {
    if (score < 5) return '#dc2626';        // Soft red
    if (score < 20) return '#FE4A49';       // Rose
    if (score < 50) return '#f59e0b';       // Amber
    if (score < 90) return '#4ade80';       // Light green
    return '#16a34a';                       // Emerald
  }
  
  toggleFavorite(c: any): void {
    c.isFavorite = !c.isFavorite;
  }

  editCandidature(c: any): void {
    // implement modal or route navigation
  }

  deleteCandidature(id: number): void {
    // call delete endpoint or filter from array
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
}
