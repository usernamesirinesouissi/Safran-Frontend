import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ValidationService, ValidationWithDemandeDTO } from '../validation.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-listeavalider',
  templateUrl: './listeavalider.component.html',
  styleUrls: ['./listeavalider.component.css']
})
export class ListeavaliderComponent implements OnInit {
 @ViewChild('deleteModal') deleteModal: TemplateRef<any>;

 @ViewChild('refuseModal') refuseModal: TemplateRef<any>;
  breadcrumb: any;
  userId = 'user_2';
  
  validations: ValidationWithDemandeDTO[] = [];
  motifRefus = '';
  selectedValidationId: number | null = null;
  filteredValidations: ValidationWithDemandeDTO[] = [];
  constructor(private validationService: ValidationService,private modalService: NgbModal, private router: Router, private route: ActivatedRoute) { }

  openRefuseModal(modalTemplate: any, validationId: number) {
    this.selectedValidationId = validationId;
    this.modalService.open(modalTemplate, { centered: true });
  }

  confirmerRefus() {
    console.log('ID de la validation refusée :', this.selectedValidationId);
    console.log('Motif du refus :', this.motifRefus);
    this.motifRefus = '';
    this.selectedValidationId = null;
    this.modalService.dismissAll();
  }

  ngOnInit(): void {
    this.breadcrumb = {
      'mainlabel': 'Demandes A Valider',
      'links': [
        {
          'name': 'Dashbaord',
          'isLink': true,
          'link': '/dashboard/sales'
        },
        
        {
          'name': 'Demandes',
          'isLink': false,
          'link': '#'
        }
     ]
    };
    this.loadValidations('PENDING');
  }


  loadValidations(status: string): void {
    this.validationService.getValidationsForUser(this.userId, status).subscribe({
      next: (data) => {
        this.validations = data; // Update the validations array
        console.log(`Loaded ${status} validations:`, data); // Check if data is being loaded correctly
      },
      error: (err) => {
        console.error('Error loading validations:', err);
      }
    });
  }

  // This function will be called when the buttons are clicked
  filterValidations(status: string): void {
    console.log(`Filtering for status: ${status}`);
    this.loadValidations(status); // Load validations with the selected status
  }

  approveValidation(validationId: string): void {
    // Just display for now - hook backend call if available
    alert(`Validation approuvée : ${validationId}`);
  }

  rejectValidation(validationId: string): void {
    // Just display for now - hook backend call if available
    alert(`Validation rejetée : ${validationId}`);
  }

  navigateToDetails(demandeId: number, validationId: string) {
    this.router.navigate(['/demande/detailavalider', demandeId, validationId]);
  }
}
