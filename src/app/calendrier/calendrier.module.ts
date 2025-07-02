import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendrierRoutingModule } from './calendrier-routing.module';
import { EntretiensComponent } from './entretiens/entretiens.component';
import { BreadcrumbModule } from '../_layout/breadcrumb/breadcrumb.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BlockUIModule } from 'ng-block-ui';
import { BlockTemplateComponent } from '../_layout/blockui/block-template.component';



@NgModule({
  declarations: [
    EntretiensComponent
  ],
  imports: [
    CommonModule,
    CalendrierRoutingModule,
     BreadcrumbModule,

        NgbModule,
         NgxDatatableModule,
            ReactiveFormsModule,
            FormsModule,
            NgSelectModule,
            BlockUIModule.forRoot({
                      template: BlockTemplateComponent
                    })
  ]
})
export class CalendrierModule { }
