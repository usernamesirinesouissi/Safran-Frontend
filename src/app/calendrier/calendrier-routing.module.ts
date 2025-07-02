import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntretiensComponent } from './entretiens/entretiens.component';


const routes: Routes = [
  { path: 'entretiens', component: EntretiensComponent }, 

];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendrierRoutingModule { }
