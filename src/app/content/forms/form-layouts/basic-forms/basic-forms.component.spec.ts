import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BasicFormsComponent } from './basic-forms.component';

describe('BasicFormsComponent', () => {
  let component: BasicFormsComponent;
  let fixture: ComponentFixture<BasicFormsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
