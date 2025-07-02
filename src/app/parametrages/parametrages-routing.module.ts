import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParametragesComponent } from './parametrages/parametrages.component';

const routes: Routes = [
  { path: '', redirectTo: '/parametrages', pathMatch: 'full' },
  { path: 'parametrages', component: ParametragesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametragesRoutingModule { }
