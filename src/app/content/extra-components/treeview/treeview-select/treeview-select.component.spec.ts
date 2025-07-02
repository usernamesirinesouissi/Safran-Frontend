import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeviewSelectComponent } from './treeview-select.component';

describe('TreeviewSelectComponent', () => {
  let component: TreeviewSelectComponent;
  let fixture: ComponentFixture<TreeviewSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeviewSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeviewSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
