import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListestagiairesComponent } from './listestagiaires.component';

describe('ListestagiairesComponent', () => {
  let component: ListestagiairesComponent;
  let fixture: ComponentFixture<ListestagiairesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListestagiairesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListestagiairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
