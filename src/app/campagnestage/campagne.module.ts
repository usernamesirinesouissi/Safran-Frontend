import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbModule } from 'src/app/_layout/breadcrumb/breadcrumb.module';
import { CampagneRoutingModule } from './campagne-routing.module';
import { ListcampagneComponent } from './listcampagne/listcampagne.component';
import { AjoutcampagneComponent } from './ajoutcampagne/ajoutcampagne.component';


@NgModule({
  declarations: [
    AjoutcampagneComponent,
    ListcampagneComponent
    
  ],
  imports: [
    CommonModule,
    CampagneRoutingModule,
    BreadcrumbModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule 
  ]
})
export class CampagneModule { }
