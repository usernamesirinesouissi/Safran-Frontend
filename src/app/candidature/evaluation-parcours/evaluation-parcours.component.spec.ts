import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationParcoursComponent } from './evaluation-parcours.component';

describe('EvaluationParcoursComponent', () => {
  let component: EvaluationParcoursComponent;
  let fixture: ComponentFixture<EvaluationParcoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationParcoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationParcoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
