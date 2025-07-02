import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandeService } from '../demande.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-updatedemande',
  templateUrl: './updatedemande.component.html',
  styleUrls: ['./updatedemande.component.css']
})
export class UpdatedemandeComponent implements OnInit {
  
  public breadcrumb: any;
  demandeForm: FormGroup;
  demandeId: number;
  competencesComportementales: any[] = [];
  competencesTechniques: any[] = [];
  formationsAcademiques: any[] = [];
  propositionsEcoles: any[] = [];
  typeStages: any[] = [];
  submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder, 
    private demandeService: DemandeService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.breadcrumb = {
      'mainlabel': 'Formulaire Mise a jour Demande de stage',
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
          'name': 'Mise a jour Demande',
          'isLink': false
        }
      ]
    };

    this.demandeId = +this.route.snapshot.paramMap.get('id'); 
    this.initializeForm();
    this.fetchDemandeData();
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

  fetchDemandeData() {
    this.demandeService.getDemandeById(this.demandeId).subscribe(
      (demande) => {
        this.demandeForm.patchValue({
          intituleProjet: demande.intituleProjet,
          descriptionProjet: demande.descriptionProjet,
          risquesProjet: demande.risquesProjet,
          objectifsProjet: demande.objectifsProjet,
          descriptionLivrables: demande.descriptionLivrables,
          effortEstime: demande.effortEstime,
          dureeEstime: demande.dureeEstime,
          nombreStagiaires: demande.nombreStagiaires,
          competencescomportementale: demande.competencescomportementale.map(c => c.id),
          competencestechnique: demande.competencestechnique.map(c => c.id),
          formationacademique: demande.formationacademique.map(f => f.id),
          propecole: demande.propecole.map(p => p.id),
          typeStage: demande.typeStage.id
        });
      },
      (error) => {
        this.toastr.error('Failed to fetch demande data.', 'Error');
        this.router.navigate(['/demandes/list']);
      }
    );
  }

  fetchOptions() {
    this.demandeService.getCompetencesComportementales().subscribe((data) => {
      this.competencesComportementales = data;
    });

    this.demandeService.getCompetencesTechniques().subscribe((data) => {
      this.competencesTechniques = data;
    });

    this.demandeService.getFormationsAcademiques().subscribe((data) => {
      this.formationsAcademiques = data;
    });

    this.demandeService.getPropositionsEcoles().subscribe((data) => {
      this.propositionsEcoles = data;
    });
    this.demandeService.getTypeStage().subscribe((data) => {
      this.typeStages = data;
    });
  }

  onUpdateSubmit() {
    this.submitted = true;
    if (this.demandeForm.invalid) {
      return;
    }

    const updatedDemande = {
      ...this.demandeForm.value,
      competencescomportementale: this.demandeForm.value.competencescomportementale.map((id: number) => ({ id })),
      competencestechnique: this.demandeForm.value.competencestechnique.map((id: number) => ({ id })),
      formationacademique: this.demandeForm.value.formationacademique.map((id: number) => ({ id })),
      propecole: this.demandeForm.value.propecole.map((id: number) => ({ id })),
      typeStage: { id: this.demandeForm.value.typeStage }
    };

    this.demandeService.updateDemande(this.demandeId, updatedDemande).subscribe(
      (response) => {
        this.toastr.success('Demande updated successfully!', 'Success');
        this.router.navigate(['/demande/list']);
      },
      (error) => {
        this.toastr.error('Failed to update demande.', 'Error');
      }
    );
    
  }
}