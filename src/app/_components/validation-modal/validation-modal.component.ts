import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NodeValidation, ValidationSeverity } from 'src/app/_api/_models/workflow.model';
import { WorkflowService } from '../../_services/workflow.service';
import { v4 as uuidv4 } from 'uuid';

interface Role {
  id: number; // Changé en number pour correspondre au backend
  name: string;
}

interface User {
  id: number; // Changé en number pour correspondre au backend
  username: string;
  email?: string;
}

@Component({
  selector: 'app-validation-modal',
  templateUrl: './validation-modal.component.html',
  styleUrls: ['./validation-modal.component.css']
})
export class ValidationModalComponent implements OnInit {
  @Input() validationType: string;
  @Input() nodeId: string;
  @Output() validationAdded = new EventEmitter<NodeValidation>();
  @Output() roleSelected = new EventEmitter<number>(); 
  
  validationForm: FormGroup;
  validationSeverities = Object.values(ValidationSeverity);
  
  availableRoles: Role[] = [];
  availableUsers: User[] = [];
  isLoadingUsers = false;
  isLoadingRoles = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private workflowService: WorkflowService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadRoles();
    this.setupRoleChangeListener();
  }

  initForm() {
    this.validationForm = this.fb.group({
      name: ['', Validators.required],
      severity: [ValidationSeverity.MEDIUM, Validators.required],
      assignedUser: [null, Validators.required], 
      assignedRole: [null, Validators.required],
      parameters: this.fb.group({
        description: [''],
        required: [false],
        timeoutMinutes: [1440],
        formTemplate: [''],
        validationType: [this.validationType]
      })
    });
  }

  loadRoles() {
    this.isLoadingRoles = true;
    this.workflowService.getAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles.map(role => ({
          id: role.id, 
          name: role.name
        }));
        this.isLoadingRoles = false;
      },
      error: (err) => {
        console.error('Error loading roles', err);
        this.isLoadingRoles = false;
      }
    });
  }

  onRoleChange(roleId: number): void {
    this.roleSelected.emit(roleId);
    this.loadUsersForRole(roleId);
  }

  loadUsersForRole(roleId: number) {
    this.isLoadingUsers = true;
    this.workflowService.getUsersByRole(roleId).subscribe({
      next: (users) => {
        this.availableUsers = users.map(user => ({
          id: Number(user.id),
          username: user.username,
          email: user.email
        }));
        this.isLoadingUsers = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.isLoadingUsers = false;
      }
    });
  }

  setupRoleChangeListener() {
    this.validationForm.get('assignedRole').valueChanges.subscribe(roleId => {
      this.onRoleChange(roleId);
      this.validationForm.get('assignedUser').reset();
    });
  }

  onSubmit() {
    const formValue = this.validationForm.value;
    console.log('Form Value:', formValue); 
  
    const validation = {
      name: formValue.name,
      severity: formValue.severity,
      assignedRole: formValue.assignedRole,
      assignedUser: formValue.assignedUser,
      parameters: formValue.parameters || {}
    };
  
    console.log('Validation Emitted:', validation);
    this.validationAdded.emit(validation);
  }

  cancel() {
    this.activeModal.dismiss();
  }
}