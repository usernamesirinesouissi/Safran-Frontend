import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentDetailsComponent } from './document-details/document-details.component';

const routes: Routes = [
   { path: 'documentslist', component: DocumentListComponent },
   { path: 'details/:candidateId', component: DocumentDetailsComponent },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule { }
