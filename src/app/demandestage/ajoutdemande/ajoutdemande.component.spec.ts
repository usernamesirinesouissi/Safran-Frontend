import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutdemandeComponent } from './ajoutdemande.component';

describe('AjoutdemandeComponent', () => {
  let component: AjoutdemandeComponent;
  let fixture: ComponentFixture<AjoutdemandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjoutdemandeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjoutdemandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
