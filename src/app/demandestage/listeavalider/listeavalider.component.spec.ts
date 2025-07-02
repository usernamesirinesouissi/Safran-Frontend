import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeavaliderComponent } from './listeavalider.component';

describe('ListeavaliderComponent', () => {
  let component: ListeavaliderComponent;
  let fixture: ComponentFixture<ListeavaliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeavaliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeavaliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
