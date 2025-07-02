import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParametragesRoutingModule } from './parametrages-routing.module';
import { ParametragesComponent } from './parametrages/parametrages.component';
import { BreadcrumbModule } from '../_layout/breadcrumb/breadcrumb.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AjouterParametresComponent } from './ajouter-parametres/ajouter-parametres.component';


@NgModule({
  declarations: [
    ParametragesComponent,
    AjouterParametresComponent
  ],
  imports: [
    CommonModule,
    ParametragesRoutingModule,
      BreadcrumbModule,
      FormsModule,
      NgbModule,
      ReactiveFormsModule
  ],
  providers: [],
 
})
export class ParametragesModule { }
