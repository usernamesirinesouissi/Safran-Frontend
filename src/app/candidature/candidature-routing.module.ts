import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListecandidatureComponent } from './listecandidature/listecandidature.component';
import { DetailcandidatureComponent } from './detailcandidature/detailcandidature.component';
import { FicheEvalGlobaleComponent } from './components/fiche-eval-globale/fiche-eval-globale.component';
import { FicheEvaluationPageComponent } from './components/fiche-evaluation-page/fiche-evaluation-page.component';
import { ListestagiairesComponent } from './listestagiaires/listestagiaires.component';
import { DetailstagiairesComponent } from './detailstagiaires/detailstagiaires.component';
import { EvaluationParcoursComponent } from './evaluation-parcours/evaluation-parcours.component';

const routes: Routes = [
  { path: 'list', component: ListecandidatureComponent },
  { path: 'detailcandidature/:id', component: DetailcandidatureComponent },
   { path: 'evaluation/entretien/:entretienId', component: FicheEvaluationPageComponent },

   { path: 'liststagiaires', component: ListestagiairesComponent },
  { path: 'detailstagiaires/:id', component: DetailstagiairesComponent },

  {
 path: 'evaluation/:candidatureId',
  component: EvaluationParcoursComponent
  
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CandidatureRoutingModule { }
