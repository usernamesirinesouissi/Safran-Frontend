import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Demande } from '../demande.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DemandeService } from '../demande.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-detailavalider',
  templateUrl: './detailavalider.component.html',
  styleUrls: ['./detailavalider.component.css']
})
export class DetailavaliderComponent implements OnInit {

  @ViewChild('refuseModal') refuseModal: TemplateRef<any>;

  validationId: string;
  demande: Demande;
  motifRefus: string = '';

  constructor( 
      private demandeService: DemandeService, private modalService: NgbModal, private route: ActivatedRoute,
          private router: Router,) { }
      ngOnInit(): void {
        // Combine paramMap and queryParams observables
        this.route.paramMap.subscribe(params => {
          const demandeId = +params.get('id');
          this.validationId = params.get('validationId');
          console.log('Validation ID:', this.validationId);
          this.demandeService.getDemandeById(demandeId).subscribe(
            (data) => {
              this.demande = data;
              console.log(this.demande);
            },
            (error) => {
              console.error('Failed to fetch demande details:', error);
            }
          );
        });
       
      }
      
  openRefuseModal() {
    this.modalService.open(this.refuseModal, { centered: true });
  }

  confirmerRefus(modal: any) {
    if (!this.motifRefus?.trim()) {
      alert('Veuillez indiquer un motif de refus.');
      return;
    }
  
    const statusUpdate = { id: 3 };
  
    this.demandeService.completeValidation(this.validationId, 'REJECTED', 'admin', this.motifRefus)
      .subscribe({
        next: () => {
          this.demandeService.updateDemandeStatus(this.demande.id, statusUpdate)
            .subscribe({
              next: () => {
                alert("Demande refusée avec succès !");
                modal.close();
                this.router.navigate(['/demandes/avalider']);
              },
              error: (error) => {
                console.error('Erreur lors de la mise à jour du statut:', error);
                alert(`Erreur: ${error.message || 'Unknown error'}`);
              }
            });
        },
        error: (error) => {
          console.error('Erreur lors du refus de la validation:', error);
          alert(`Erreur: ${error.message || 'Unknown error'}`);
        }
      });
  }
  
  
  

  validerDemande() {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir valider cette demande ?");
    if (confirmed) {
      this.demandeService.approveValidation(this.validationId, 'APPROVED', 'admin', '')
      .subscribe({
        next: () => {
            alert("Demande validée avec succès !");
            this.router.navigate(['/demandes/avalider']);
        },
        error: (error) => {
            console.error('Erreur lors de la validation:', error);
            alert("Erreur lors de la validation.");
        }
    });
    }
  }
  
}