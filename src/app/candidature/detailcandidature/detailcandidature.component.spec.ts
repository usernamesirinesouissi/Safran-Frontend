import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailcandidatureComponent } from './detailcandidature.component';

describe('DetailcandidatureComponent', () => {
  let component: DetailcandidatureComponent;
  let fixture: ComponentFixture<DetailcandidatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailcandidatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailcandidatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
