import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AjoutcampagneComponent } from './ajoutcampagne/ajoutcampagne.component';
import { ListcampagneComponent } from './listcampagne/listcampagne.component';

const routes: Routes = [ 
  
  { path: 'nouvelle', component: AjoutcampagneComponent },
  {path:'liste', component:ListcampagneComponent}
];  

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampagneRoutingModule { }
