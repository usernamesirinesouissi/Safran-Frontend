import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailavaliderComponent } from './detailavalider.component';

describe('DetailavaliderComponent', () => {
  let component: DetailavaliderComponent;
  let fixture: ComponentFixture<DetailavaliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailavaliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailavaliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
