import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder, NgForm } from '@angular/forms';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { DemandeService } from '../demande.service';
import { Demande } from '../demande.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ajoutdemande',
  templateUrl: './ajoutdemande.component.html',
  styleUrls: ['./ajoutdemande.component.css']
})
export class AjoutdemandeComponent implements OnInit {
  @ViewChild('f', { read: true }) userProfileForm: NgForm;

  model: any = {};
  options = {
    minimize: true,
    reload: true,
    expand: true,
    close: true
  };
  public breadcrumb: any;
  
  demandeForm: FormGroup;
  submitted = false;
  competencesComportementales: any[] = [];
  competencesTechniques: any[] = [];
  formationsAcademiques: any[] = [];
  propositionsEcoles: any[] = [];
  typeStage: any[] = [];
  
  constructor(private formBuilder: FormBuilder, private demandeService: DemandeService, private router: Router,private toastr: ToastrService ) { }

  ngOnInit() {
    this.breadcrumb = {
      'mainlabel': 'Formulaire Ajout Demande de stage',
      'links': [
        {
          'name': 'Dashboard',
          'isLink': true,
          'link': '/dashboard/sales'
        },
        {
          'name': 'Demandes',
          'isLink': true,
          'link': '#'
        },
        {
          'name': 'Ajout Demande',
          'isLink': false
        }
      ]
    };

    this.initializeForm();
    this.fetchOptions();
  }
  initializeForm() {
    this.demandeForm = this.formBuilder.group({
      intituleProjet: ['', Validators.required],
      descriptionProjet: ['', Validators.required],
      risquesProjet: ['', Validators.required],
      objectifsProjet: ['', Validators.required],
      descriptionLivrables: ['', Validators.required],
      effortEstime: ['', Validators.required],
      dureeEstime: ['', Validators.required],
      nombreStagiaires: ['', Validators.required],
      competencescomportementale: [[], Validators.required],
      competencestechnique: [[], Validators.required],
      formationacademique: [[], Validators.required],
      propecole: [[], Validators.required],
      typeStage: [null, Validators.required] 
    });
  }

  fetchOptions() {
    this.demandeService.getCompetencesComportementales().subscribe((data) => {
      this.competencesComportementales = data;
      console.log('Competences Comportementales:', data);
    });

    this.demandeService.getCompetencesTechniques().subscribe((data) => {
      this.competencesTechniques = data;
      console.log('Competences Techniques:', data);
    });

    this.demandeService.getFormationsAcademiques().subscribe((data) => {
      this.formationsAcademiques = data;
      console.log('Formations Académiques:', data);
    });

    this.demandeService.getPropositionsEcoles().subscribe((data) => {
      this.propositionsEcoles = data;
      console.log('Propositions Écoles:', data);
    });
    this.demandeService.getTypeStage().subscribe((data) => {
      this.typeStage = data;
      console.log('Type Stage :', data);
    });
  }

  onDemandeSubmit() {
    this.submitted = true;

    if (this.demandeForm.invalid) {
      return;
    }

    const demande = {
      ...this.demandeForm.value,
      competencescomportementale: this.demandeForm.value.competencescomportementale.map((id: number) => ({ id })),
      competencestechnique: this.demandeForm.value.competencestechnique.map((id: number) => ({ id })),
      formationacademique: this.demandeForm.value.formationacademique.map((id: number) => ({ id })),
      propecole: this.demandeForm.value.propecole.map((id: number) => ({ id })),
      typeStage: { id: this.demandeForm.value.typeStage }
    };
    console.log("Demande to be sent:", demande);
    this.demandeService.createDemande(demande).subscribe(
      (response) => {
        console.log('Demande created successfully:', response);
        this.demandeForm.reset();
        this.submitted = false;
        this.router.navigate(['/demande/list'], { queryParams: { success: 'true' } });
        this.toastr.success('Demande de stage ajoutée avec succès.', 'Succès',{ timeOut: 3000, disableTimeOut: true, closeButton: true });
      },
      (error) => {
        console.error('Error creating Demande:', error);
        this.toastr.error('Une erreur est survenue lors de l\'ajout de la demande.', 'Erreur');
      }
    );
  }
}
 