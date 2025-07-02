import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterParametresComponent } from './ajouter-parametres.component';

describe('AjouterParametresComponent', () => {
  let component: AjouterParametresComponent;
  let fixture: ComponentFixture<AjouterParametresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjouterParametresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjouterParametresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
