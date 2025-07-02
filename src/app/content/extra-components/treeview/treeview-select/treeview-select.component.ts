
import { Component, Input, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { isNil } from 'lodash';
import { TreeviewI18n, TreeviewItem, TreeviewConfig, DropdownTreeviewComponent, TreeviewHelper } from 'ngx-treeview';
// import { TreeviewService } from '../../../_services/treeview.service';

@Component({
  selector: 'app-treeview-select',
  templateUrl: './treeview-select.component.html',
  styleUrls: ['./treeview-select.component.css'],
  // providers: [
  //   { provide: TreeviewI18n, useClass: TreeviewService }
  // ]
})
export class TreeviewSelectComponent {
  @Input() config: TreeviewConfig;
  @Input() items: TreeviewItem[];
  @Input() value: any;
  // @Output() valueChange = new EventEmitter<any>();
  // @ViewChild(DropdownTreeviewComponent, { static: false }) dropdownTreeviewComponent: DropdownTreeviewComponent;
  // filterText: string;
  // private dropdownTreeviewSelectI18n: TreeviewService;

  constructor() {
    // this.config = TreeviewConfig.create({
    //   hasAllCheckBox: false,
    //   hasCollapseExpand: false,
    //   hasFilter: true,
    //   maxHeight: 500
    // });
    // this.dropdownTreeviewSelectI18n = i18n as TreeviewService;
  }
  // select(item: TreeviewItem): void {
  //   if (!item.children) {
  //     this.selectItem(item);
  //   }
  // }

  // private updateSelectedItem(): void {
  //   if (!isNil(this.items)) {
  //     const selectedItem = TreeviewHelper.findItemInList(this.items, this.value);
  //     // this.selectItem(selectedItem);
  //   }
  // }

  // private selectItem(item: TreeviewItem): void {
  //   if (this.dropdownTreeviewSelectI18n.selectedItem !== item) {
  //     this.dropdownTreeviewSelectI18n.selectedItem = item;
  //     if (this.dropdownTreeviewComponent) {
  //       this.dropdownTreeviewComponent.onSelectedChange([item]);
  //     }

  //     if (item) {
  //       if (this.value !== item.value) {
  //         this.value = item.value;
  //         this.valueChange.emit(item.value);
  //       }
  //     }
  //   }
  // }
}