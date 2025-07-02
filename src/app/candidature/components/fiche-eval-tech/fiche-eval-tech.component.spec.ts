import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheEvalTechComponent } from './fiche-eval-tech.component';

describe('FicheEvalTechComponent', () => {
  let component: FicheEvalTechComponent;
  let fixture: ComponentFixture<FicheEvalTechComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FicheEvalTechComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FicheEvalTechComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
