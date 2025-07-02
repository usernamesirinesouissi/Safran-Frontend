import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AjoutdemandeComponent } from './ajoutdemande/ajoutdemande.component';
import { ListedemandeComponent } from './listedemande/listedemande.component';
import { DemandeRoutingModule } from './demandestage-routing.module';
import { BreadcrumbModule } from "../_layout/breadcrumb/breadcrumb.module";
import { BlockUIModule } from 'ng-block-ui';
import { BlockTemplateComponent } from '../_layout/blockui/block-template.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { UpdatedemandeComponent } from './updatedemande/updatedemande.component';
import { DetailsdemandeComponent } from './detailsdemande/detailsdemande.component';
import { ListeavaliderComponent } from './listeavalider/listeavalider.component';
import { DetailavaliderComponent } from './detailavalider/detailavalider.component';
import { ListesujetstageComponent } from './listesujetstage/listesujetstage.component';



@NgModule({
  declarations: [
    AjoutdemandeComponent,
    ListedemandeComponent,
    UpdatedemandeComponent,
    DetailsdemandeComponent,
    ListeavaliderComponent,
    DetailavaliderComponent,
    ListesujetstageComponent
  ],
  imports: [
    CommonModule,
    DemandeRoutingModule,
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
export class DemandestageModule { }
