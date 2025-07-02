import { Component, Input, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { isNil } from 'lodash';
import { TreeviewI18n, TreeviewItem, TreeviewConfig, DropdownTreeviewComponent, TreeviewHelper } from 'ngx-treeview';
@Component({
  selector: 'app-treeview-icon',
  templateUrl: './treeview-icon.component.html',
  styleUrls: ['./treeview-icon.component.css']
})
export class TreeviewIconComponent  {
  @Input() config: TreeviewConfig;
  @Input() items: any[]=[];
  @Input() value: any;
  constructor() {
  
   }

  test(item){
      console.log(item)
  }
}
