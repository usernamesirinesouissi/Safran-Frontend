import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutcampagneComponent } from './ajoutcampagne.component';

describe('AjoutcampagneComponent', () => {
  let component: AjoutcampagneComponent;
  let fixture: ComponentFixture<AjoutcampagneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjoutcampagneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjoutcampagneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
