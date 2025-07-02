import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AjoutdemandeComponent } from './ajoutdemande/ajoutdemande.component';
import { ListedemandeComponent } from './listedemande/listedemande.component';
import { UpdatedemandeComponent } from './updatedemande/updatedemande.component';
import { DetailsdemandeComponent } from './detailsdemande/detailsdemande.component';
import { ListeavaliderComponent } from './listeavalider/listeavalider.component';
import { DetailavaliderComponent } from './detailavalider/detailavalider.component';
import { ListesujetstageComponent } from './listesujetstage/listesujetstage.component';


const routes: Routes = [
  { path: 'list', component: ListedemandeComponent }, 
  { path: 'avalider', component: ListeavaliderComponent }, 
  { path: 'ajout', component: AjoutdemandeComponent },
  { path:'update/:id',component: UpdatedemandeComponent},
  { path:'detail/:id',component: DetailsdemandeComponent},
  { path:'detailavalider/:id/:validationId',component: DetailavaliderComponent},
  { path: 'sujetsstage', component: ListesujetstageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemandeRoutingModule { }
