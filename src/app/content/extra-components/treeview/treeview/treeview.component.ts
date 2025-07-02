import { Component, OnInit } from '@angular/core';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';

@Component({
  selector: 'app-treeview',
  templateUrl: './treeview.component.html',
  styleUrls: ['./treeview.component.css']
})
export class TreeviewComponent implements OnInit {
  options = {
    close: true,
    expand: true,
    minimize: true,
    reload: true
  };
  public breadcrumb: any;
  value = 11;
  items: TreeviewItem[];
  item: TreeviewItem[];
  treeIcon: any[]=[];
  config = TreeviewConfig.create({
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: true,
    maxHeight: 400
  });
  basicConfig = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: true,
    hasCollapseExpand: true,
    maxHeight: 400
  });
  constructor() { }

  ngOnInit() {
    this.breadcrumb = {
      mainlabel: 'Tree View',
      links: [
        {
          'name': 'Home',
          'isLink': true,
          'link': '/dashboard/sales'
        },
        {
          'name': 'Pages',
          'isLink': true,
          'link': '#'
        },
        {
          'name': 'Treeview',
          'isLink': false
        }
      ]
    };
    this.items = this.getBooks();
    this.item = this.getBooks();
    this.treeIcon = this.getBookIcon();
  }

  getBooks(): TreeviewItem[] {

    const childrenCategory = new TreeviewItem({
      text: "Children",
      value: 1,
      collapsed: true,
      children: [
        { text: "Baby 3-5", value: 11 },
        { text: "Baby 6-8", value: 12 },
        { text: "Baby 9-12", value: 13 }
      ]
    });


    const itCategory = new TreeviewItem({
      text: "IT",
      value: 9,
      children: [
        {
          text: "Programming",
          value: 91,
          children: [
            {
              text: "Frontend",
              value: 911,
              children: [
                { text: "Angular 1", value: 9111 },
                { text: "Angular 2", value: 9112 },
                { text: "ReactJS", value: 9113, disabled: true }
              ]
            },
            {
              text: "Backend",
              value: 912,
              children: [
                { text: "C#", value: 9121 },
                { text: "Java", value: 9122 },
                { text: "Python", value: 9123, checked: false, disabled: true }
              ]
            }
          ]
        },
        {
          text: "Networking",
          value: 92,
          children: [
            { text: "Internet", value: 921 },
            { text: "Security", value: 922 }
          ]
        }
      ]
    });
    const teenCategory = new TreeviewItem({
      text: "Teen",
      value: 2,
      collapsed: true,
      disabled: true,
      children: [
        { text: "Adventure", value: 21 },
        { text: "Science", value: 22 }
      ]
    });
    const othersCategory = new TreeviewItem({
      text: "Others",
      value: 3,
      checked: false,
      disabled: true
    });

    return [childrenCategory, itCategory, teenCategory, othersCategory];
  }
  getBookIcon() {

    const childrenCategory = ({
      text: "Social Network",
      icon: "la la-user mr-1",
      collapsed: true,
      children: [
        { text: "Facebook", icon: 'la la-facebook mr-1' },
        { text: "Twitter", icon: 'la la-twitter mr-1' },
        { text: "Gmail", icon: 'la la-google mr-1' }
      ]
    });
   const itCategory = ({
         text: "Email",
          icon: "la la-envelope mr-1",
          collapsed: false,
          children: [
            {
              text: "Inbox",
              icon: 'feather ft-inbox mr-1',
              collapsed: false,
              children: [
                { text: "Trash", icon: 'feather ft-trash-2 mr-1' },
                { text: "Sent", icon: 'la la-paper-plane-o mr-1' },
                { text: "Draft", icon: 'feather ft-file mr-1' },
               ]
            },
            {
              text: "Catagories",
              collapsed: false,
              icon: 'la la-chevron-right mr-1',
              children: [
                { text: "Social", icon: 'la la-users mr-1' },
                { text: "Updates", icon: 'la la-exclamation-circle mr-1' },
                { text: "Forums",  icon: 'la la-file-text mr-1' },
                { text: "Promotaions",  icon: 'ficon feather ft-tag mr-1' }
              ]
            },
            {
          text: "Networking",
          icon: "la la-globe mr-1",
          collapsed: false,
          children: [
            { text: "Internet", icon:'la la-internet-explorer mr-1' },
            { text: "Chrome", icon:'la la-chrome mr-1' }
          ]
        }
      ]
    });
    const teenCategory = ({
      text: "File",
      icon: 'la la-file mr-1',
      collapsed: true,
      disabled: true,
      children: [
            { text: "Pdf", icon: 'la la-file-pdf-o mr-1'},
            { text: "Zip", icon: 'la la-file-zip-o mr-1'},
            { text: "Word", icon: 'la la-file-word-o mr-1'},
            { text: "Image", icon: 'la la-file-image-o mr-1'},
      ]
    });
   

    return [childrenCategory, itCategory, teenCategory];
  }
  onFilterChange(value: string) {
    console.log('filter:', value);
  }
}