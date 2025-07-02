import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-entretiens',
  templateUrl: './entretiens.component.html',
  styleUrls: ['./entretiens.component.css']
})
export class EntretiensComponent implements OnInit {
  breadcrumb: any;
 
  constructor() { }

  ngOnInit(): void {
    this.breadcrumb = {
      'mainlabel': 'Suivi des candidatures',
      'links': [
        {
          'name': 'Dashbaord',
          'isLink': true,
          'link': '/dashboard/sales'
        },
        
        {
          'name': 'candidatures',
          'isLink': false,
          'link': '#'
        }
     ]
    };
  }

}
