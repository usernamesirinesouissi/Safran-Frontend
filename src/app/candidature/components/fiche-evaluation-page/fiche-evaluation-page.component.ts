// src/app/candidature/components/fiche-evaluation-page/fiche-evaluation-page.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-fiche-evaluation-page',
  template: `
    <div class="container-fluid mt-3">
      <app-fiche-eval-globale [entretienId]="entretienId"></app-fiche-eval-globale>
    </div>
  `
})
export class FicheEvaluationPageComponent implements OnInit {
  entretienId: number;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('entretienId');
    if (idParam) {
      this.entretienId = +idParam;
    } else {
      console.error("ID d'entretien manquant dans l'URL");
      // Gérer l'erreur, peut-être rediriger ou afficher un message
    }
  }
}