import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheEvalGlobaleComponent } from './fiche-eval-globale.component';

describe('FicheEvalGlobaleComponent', () => {
  let component: FicheEvalGlobaleComponent;
  let fixture: ComponentFixture<FicheEvalGlobaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FicheEvalGlobaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FicheEvalGlobaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
