import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListecandidatureComponent } from './listecandidature/listecandidature.component';
import { CandidatureRoutingModule } from './candidature-routing.module';
import { BreadcrumbModule } from "../_layout/breadcrumb/breadcrumb.module";
import { BlockUIModule } from 'ng-block-ui';
import { BlockTemplateComponent } from '../_layout/blockui/block-template.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DetailcandidatureComponent } from './detailcandidature/detailcandidature.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FicheEvalGlobaleComponent } from './components/fiche-eval-globale/fiche-eval-globale.component';
import { FicheEvalRhComponent } from './components/fiche-eval-rh/fiche-eval-rh.component';
import { FicheEvalTechComponent } from './components/fiche-eval-tech/fiche-eval-tech.component';
import { FicheEvaluationPageComponent } from './components/fiche-evaluation-page/fiche-evaluation-page.component';
import { DetailstagiairesComponent } from './detailstagiaires/detailstagiaires.component';
import { ListestagiairesComponent } from './listestagiaires/listestagiaires.component';
import { EvaluationParcoursComponent } from './evaluation-parcours/evaluation-parcours.component';

import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ListecandidatureComponent,
    DetailcandidatureComponent,
    FicheEvalGlobaleComponent,
    FicheEvalRhComponent,
    FicheEvalTechComponent,
    FicheEvaluationPageComponent,
    DetailstagiairesComponent,
    ListestagiairesComponent,
EvaluationParcoursComponent  ],
  imports: [
    CommonModule,
    CandidatureRoutingModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    HttpClientModule ,
    NgbTooltipModule,
    BlockUIModule.forRoot({
                  template: BlockTemplateComponent
                })
]
})
export class CandidatureModule { }
