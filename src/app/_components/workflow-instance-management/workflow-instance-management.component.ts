import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from '../../_services/workflow.service';
import { WorkflowInstance } from 'src/app/_api/_models/workflow.model';


@Component({
  selector: 'app-workflow-instance-management',
  templateUrl: './workflow-instance-management.component.html',
  styleUrls: ['./workflow-instance-management.component.css']
})
export class WorkflowInstanceManagementComponent implements OnInit {
  workflowInstances: WorkflowInstance[] = [];
  loading = true;
  error = false;
  instanceDetailsModalVisible = false;
  selectedInstance: WorkflowInstance | null = null;
  validationModalVisible = false;
validationDecision: string = '';
validationComments: string = '';
currentValidationId: string = '';
currentNodeId: string = '';
public breadcrumb: any;

  constructor(
    private workflowService: WorkflowService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {

    this.breadcrumb = {
      'mainlabel': 'Workflow ',
      'links': [
        {
          title: 'Liste des Campagnes',
           'isLink': true,
          'link': '#'
        },
        {
          title: 'Ajout Campagne',
'isLink': false        },
      ]
    };

    this.route.queryParams.subscribe(params => {
      const definitionId = params['definitionId'];
      if (definitionId) {
        this.loadWorkflowInstancesByDefinition(definitionId);
      } else {
        this.loadWorkflowInstances();
      }
    });
  }
  
  loadWorkflowInstancesByDefinition(definitionId: string): void {
    this.loading = true;
    this.error = false;
    
    this.workflowService.getWorkflowInstancesByDefinitionId(definitionId).subscribe({
      next: (instances) => {
        this.workflowInstances = instances;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading workflow instances by definition:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
  
  loadWorkflowInstances(): void {
    this.loading = true;
    this.error = false;
    
    this.workflowService.getAllWorkflowInstances().subscribe({
      next: (instances) => {
        this.workflowInstances = instances;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading workflow instances:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
  
  viewInstanceDetails(id: string): void {
    this.workflowService.getWorkflowInstanceById(id).subscribe({
      next: (instance) => {
       
        const instanceCopy = JSON.parse(JSON.stringify(instance));
        
     
        if (!instanceCopy.nodeInstances) {
          instanceCopy.nodeInstances = [];
        }
        
     
        if (!instanceCopy.variables) {
          instanceCopy.variables = {};
        }
        
        this.selectedInstance = instanceCopy;
        this.instanceDetailsModalVisible = true;
        
 
        console.log('Selected instance:', this.selectedInstance);
        console.log('Node instances:', this.selectedInstance.nodeInstances);
        console.log('Variables:', this.selectedInstance.variables);
      },
      error: (err) => {
        console.error('Error fetching workflow instance details:', err);
        alert('Failed to fetch instance details');
      }
    });
  }
  
  closeDetailsModal(): void {
    this.instanceDetailsModalVisible = false;
    this.selectedInstance = null;
  }
  
  getDurationString(startedAt: string, completedAt: string | null): string {
    if (!startedAt) return 'N/A';
    
    if (!completedAt) {
      const started = new Date(startedAt);
      const now = new Date();
      const durationMs = now.getTime() - started.getTime();
      const durationMin = Math.floor(durationMs / 60000);
      return `${durationMin} minutes (running)`;
    }
    
    const started = new Date(startedAt);
    const completed = new Date(completedAt);
    const durationMs = completed.getTime() - started.getTime();
    const durationMin = Math.floor(durationMs / 60000);
    
    return `${durationMin} minutes`;
  }
  
  getStatusClass(status: string | undefined): string {
    if (!status) return 'pending';
    
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'completed';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'FAILED':
        return 'failed';
      case 'CANCELED':
        return 'canceled';
      case 'PENDING':
        return 'pending';
      case 'ACTIVE':
        return 'pending';
      case 'APPROVED':
        return 'completed';
      default:
        return 'pending';
    }
  }
  
  getCompletionPercentage(instance: WorkflowInstance): number {
    if (!instance || !instance.nodeInstances || instance.nodeInstances.length === 0) {
      return 0;
    }
    
    const totalNodes = instance.nodeInstances.length;
    const completedNodes = instance.nodeInstances.filter(
      ni => ni.status === 'COMPLETED'
    ).length;
    
    return Math.round((completedNodes / totalNodes) * 100);
  }
  
  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  getVariableSummary(variables: Record<string, any> | undefined): string {
    if (!variables || Object.keys(variables).length === 0) {
      return 'No variables';
    }
    
    const entries = Object.entries(variables);
    if (entries.length <= 2) {
      return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
    }
    
    return `${entries.length} variables`;
  }
  
  hasValidationInstances(): boolean {
    if (!this.selectedInstance || !this.selectedInstance.nodeInstances) {
      return false;
    }
    return this.selectedInstance.nodeInstances.some(ni => ni.validationInstances && ni.validationInstances.length > 0);
  }

  goToWorkflows(): void {
    this.router.navigate(['/workflows']);
  }

  openValidationModal(validationId: string, nodeId: string): void {
    this.currentValidationId = validationId;
    this.currentNodeId = nodeId;
    this.validationDecision = '';
    this.validationComments = '';
    this.validationModalVisible = true;
  }
  
  closeValidationModal(): void {
    this.validationModalVisible = false;
  }
  
  submitValidationDecision(): void {
    if (!this.validationDecision) {
      alert('Veuillez sélectionner une décision');
      return;
    }
    
    //mock current user
    const currentUser = 'user456'; 
    
    this.workflowService.completeValidation(
      this.currentValidationId,
      this.validationDecision,
      currentUser,
      this.validationComments
    ).subscribe({
      next: () => {
        this.closeValidationModal();
        if (this.selectedInstance) {
          this.viewInstanceDetails(this.selectedInstance.id);
        }
      },
      error: (err) => {
        console.error('Error completing validation:', err);
        alert('Échec de la validation. Veuillez réessayer.');
      }
    });
  }
}