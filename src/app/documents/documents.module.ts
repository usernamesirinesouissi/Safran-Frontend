import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentsRoutingModule } from './documents-routing.module';
import { DocumentListComponent } from './document-list/document-list.component';
import { FormsModule } from '@angular/forms';
import { DocumentDetailsComponent } from './document-details/document-details.component'; // Ajoutez cette ligne


@NgModule({
  declarations: [
    DocumentListComponent,
    DocumentDetailsComponent
  ],
  imports: [
    CommonModule,
    DocumentsRoutingModule
  ]
})
export class DocumentsModule { }
