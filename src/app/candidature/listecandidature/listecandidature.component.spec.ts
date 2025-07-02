import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListecandidatureComponent } from './listecandidature.component';

describe('ListecandidatureComponent', () => {
  let component: ListecandidatureComponent;
  let fixture: ComponentFixture<ListecandidatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListecandidatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListecandidatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
