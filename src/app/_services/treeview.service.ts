import { Injectable } from '@angular/core';
import { TreeviewItem, TreeviewSelection, DefaultTreeviewI18n } from 'ngx-treeview';
@Injectable({
  providedIn: 'root'
})
export class TreeviewService extends DefaultTreeviewI18n{
  private internalSelectedItem: TreeviewItem;

  set selectedItem(value: TreeviewItem) {
    this.internalSelectedItem = value;
  }

  get selectedItem(): TreeviewItem {
    return this.internalSelectedItem;
  }

  getText(selection: TreeviewSelection): string {
    return this.internalSelectedItem ? this.internalSelectedItem.text : 'Please select';
  }
}