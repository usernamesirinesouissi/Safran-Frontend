import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheEvaluationPageComponent } from './fiche-evaluation-page.component';

describe('FicheEvaluationPageComponent', () => {
  let component: FicheEvaluationPageComponent;
  let fixture: ComponentFixture<FicheEvaluationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FicheEvaluationPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FicheEvaluationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
