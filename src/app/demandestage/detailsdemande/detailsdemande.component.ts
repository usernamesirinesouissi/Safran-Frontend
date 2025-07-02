import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Demande } from '../demande.model';
import { ActivatedRoute } from '@angular/router';
import { DemandeService } from '../demande.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-detailsdemande',
  templateUrl: './detailsdemande.component.html',
  styleUrls: ['./detailsdemande.component.css']
})
export class DetailsdemandeComponent implements OnInit {
   @ViewChild('refuseModal') refuseModal: TemplateRef<any>;
  demande: Demande;
  validations: any[] = [];
  selectedMotif: string = '';

  constructor( private route: ActivatedRoute,
    private demandeService: DemandeService, private modalService: NgbModal) { }

  ngOnInit(): void {
    const demandeId = +this.route.snapshot.paramMap.get('id');
    this.demandeService.getDemandeById(demandeId).subscribe(
      (data) => {
        this.demande = data;
        this.loadValidations(demandeId); 
      },
      (error) => {
        console.error('Failed to fetch demande details:', error);
      }
    );

   
  }

  loadValidations(demandeId: number) {
    this.demandeService.getValidationsForDemande(demandeId).subscribe((validations: any[]) => {
      this.validations = validations;
      const refusedValidation = validations.find(v => v.status === 'REJECTED');
      if (refusedValidation) {
        this.selectedMotif = refusedValidation.comments;
      }
    });
  }

  openMotifRefusModal(motif: string) {
    this.selectedMotif = motif;
    this.modalService.open(this.refuseModal, { centered: true });
  }
  
  }


