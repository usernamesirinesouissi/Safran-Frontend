import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowInstanceManagementComponent } from './workflow-instance-management.component';

describe('WorkflowInstanceManagementComponent', () => {
  let component: WorkflowInstanceManagementComponent;
  let fixture: ComponentFixture<WorkflowInstanceManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowInstanceManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowInstanceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
