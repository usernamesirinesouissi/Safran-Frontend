import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeviewIconComponent } from './treeview-icon.component';

describe('TreeviewIconComponent', () => {
  let component: TreeviewIconComponent;
  let fixture: ComponentFixture<TreeviewIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeviewIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeviewIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
