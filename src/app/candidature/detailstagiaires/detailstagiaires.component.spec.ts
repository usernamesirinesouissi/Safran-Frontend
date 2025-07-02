import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailstagiairesComponent } from './detailstagiaires.component';

describe('DetailstagiairesComponent', () => {
  let component: DetailstagiairesComponent;
  let fixture: ComponentFixture<DetailstagiairesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailstagiairesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailstagiairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
