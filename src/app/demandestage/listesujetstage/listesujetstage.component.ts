import { Component, OnInit } from '@angular/core';
import { Demande } from '../demande.model';
import { DemandeService } from '../demande.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { generateCustomPdf } from '../generatePfePresentation';

@Component({
  selector: 'app-listesujetstage',
  templateUrl: './listesujetstage.component.html',
  styleUrls: ['./listesujetstage.component.css']
})
export class ListesujetstageComponent implements OnInit {

    breadcrumb: any;
    demandes: Demande[] = [];
    currentPage = 1;
    itemsPerPage = 10;
  constructor(private demandeService: DemandeService,private route: ActivatedRoute,
      private toastr: ToastrService,private modalService: NgbModal) { }

  ngOnInit(): void {

    this.breadcrumb = {
      'mainlabel': 'Liste Sujets Stage',
      'links': [
        {
          'name': 'Dashbaord',
          'isLink': true,
          'link': '/dashboard/sales'
        },
        
        {
          'name': 'Sujets',
          'isLink': false,
          'link': '#'
        }
     ]
    };
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.demandeService.getSujets().subscribe(
      (data) => {
        this.demandes = data;
      },
      (error) => {
        console.error('Error fetching demandes:', error);
      }
    );
  }

  onDownloadPdf() {
    generateCustomPdf(this.demandes);
  }
}
