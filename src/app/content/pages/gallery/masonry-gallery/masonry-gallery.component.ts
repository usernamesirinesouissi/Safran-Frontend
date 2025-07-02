import { Component, OnInit } from '@angular/core';
import { IMasonryGalleryImage } from 'ngx-masonry-gallery';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
@Component({
  selector: 'app-masonry-gallery',
  templateUrl: './masonry-gallery.component.html',
  styleUrls: ['./masonry-gallery.component.css']
})
export class MasonryGalleryComponent implements OnInit {

  options = {
    close: true,
    expand: false,
    minimize: false,
    reload: true
  };
  imageoptions = {
    close: true,
    expand: true,
    minimize: true,
    reload: true
  };

  @BlockUI('masonryImageGallery') blockUIMasonryImageGallery: NgBlockUI;

  public breadcrumb: any;
  public class: string[] = ['img-thumbnail'];
  private image: string[] = [
    '../../../../../assets/images/portfolio/width-600/portfolio-10.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-8.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-21.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-14.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-1.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-3.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-4.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-2.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-6.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-22.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-9.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-7.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-26.jpg',
    '../../../../../assets/images/portfolio/width-600/portfolio-11.jpg',
  ];


  constructor() { }

  ngOnInit() {
    this.breadcrumb = {
      'mainlabel': 'Gallery Masonry Grid',
      'links': [
        {
          'name': 'Home',
          'isLink': true,
          'link': '/dashboard/sales'
        },
        {
          'name': 'Gallery',
          'isLink': true,
          'link': ''
        },
        {
          'name': 'Gallery Masonry Grid',
          'isLink': false
        }
      ]
    };
  }
  public get images(): IMasonryGalleryImage[] {
    return this.image.map(m => <IMasonryGalleryImage>{
      imageUrl: m,

    });
  }

  reloadMasonryImageGallery() {
    this.blockUIMasonryImageGallery.start('Loading..');

    setTimeout(() => {
      this.blockUIMasonryImageGallery.stop();
    }, 2500);
  }
}
