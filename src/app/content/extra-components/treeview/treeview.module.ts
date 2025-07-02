import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeviewComponent } from './treeview/treeview.component';
import { RouterModule } from '@angular/router';
import { CardModule } from './../../partials/general/card/card.module';
import { TreeviewModule } from 'ngx-treeview';
import { FormsModule } from '@angular/forms';
import { TreeviewSelectComponent } from './treeview-select/treeview-select.component';
import { TreeviewIconComponent } from './treeview-icon/treeview-icon.component';
import { BreadcrumbModule } from 'src/app/_layout/breadcrumb/breadcrumb.module';
@NgModule({
  declarations: [TreeviewComponent,TreeviewSelectComponent, TreeviewIconComponent],
  imports: [
    CommonModule,
    CardModule,
    BreadcrumbModule,
    FormsModule,
    TreeviewModule.forRoot(),
    RouterModule.forChild([
      {
        path: 'treeview',
        component: TreeviewComponent
      }
    ])
  ],
  exports: [
    TreeviewSelectComponent,
    TreeviewIconComponent
  ]
})
export class TreeViewModule { }
