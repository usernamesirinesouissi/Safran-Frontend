import { Component, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { NgbdSortableHeader } from 'src/app/_directives/sortable.directive';
import { NgbSortable } from 'src/app/content/table/boostraptables/ngxboostraptables/ngxboostraptables.component';
import { Demande } from '../demande.model';
import { DemandeService } from '../demande.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-listedemande',
  templateUrl: './listedemande.component.html',
  styleUrls: ['./listedemande.component.css']
})
export class ListedemandeComponent implements OnInit {

  @ViewChild('deleteModal') deleteModal: TemplateRef<any>;
  breadcrumb: any;
  demandes: Demande[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  
  constructor(private demandeService: DemandeService,private route: ActivatedRoute,
    private toastr: ToastrService,private modalService: NgbModal) { }
    
    openDeleteConfirmationModal(demandeId: number) {
      this.modalService.open(this.deleteModal).result.then(
        (result) => {
          if (result === 'delete') {
            this.deleteDemande(demandeId);
          }
        },
        () => {
          // Dismissed (canceled)
        }
      );
    }
  
    deleteDemande(id: number) {
      this.demandeService.deleteDemande(id).subscribe(
        () => {
          this.toastr.success('Demande deleted successfully!', 'Success');
          this.loadDemandes();
        },
        (error) => {
          this.toastr.error('Failed to delete demande.', 'Error');
        }
      );
    }
  ngOnInit(): void {
    this.breadcrumb = {
      'mainlabel': 'Suivi Mes Demandes',
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
   
    this.loadDemandes();
  }
  
  loadDemandes(): void {
    this.demandeService.getDemandes().subscribe(
      (data) => {
        this.demandes = data;
      },
      (error) => {
        console.error('Error fetching demandes:', error);
      }
    );
  }
}
