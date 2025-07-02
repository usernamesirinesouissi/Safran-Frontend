import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListesujetstageComponent } from './listesujetstage.component';

describe('ListesujetstageComponent', () => {
  let component: ListesujetstageComponent;
  let fixture: ComponentFixture<ListesujetstageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListesujetstageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListesujetstageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
