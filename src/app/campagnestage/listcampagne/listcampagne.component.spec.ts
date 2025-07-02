import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListcampagneComponent } from './listcampagne.component';

describe('ListcampagneComponent', () => {
  let component: ListcampagneComponent;
  let fixture: ComponentFixture<ListcampagneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListcampagneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListcampagneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
