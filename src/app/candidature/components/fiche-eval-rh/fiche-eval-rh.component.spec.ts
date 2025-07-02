import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheEvalRhComponent } from './fiche-eval-rh.component';

describe('FicheEvalRhComponent', () => {
  let component: FicheEvalRhComponent;
  let fixture: ComponentFixture<FicheEvalRhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FicheEvalRhComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FicheEvalRhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
