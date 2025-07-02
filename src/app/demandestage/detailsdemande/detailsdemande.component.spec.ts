import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsdemandeComponent } from './detailsdemande.component';

describe('DetailsdemandeComponent', () => {
  let component: DetailsdemandeComponent;
  let fixture: ComponentFixture<DetailsdemandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsdemandeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsdemandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
