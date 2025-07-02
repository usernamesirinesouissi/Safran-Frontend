import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { WorkflowService } from '../../_services/workflow.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WorkflowDefinition } from 'src/app/_api/_models/workflow.model';
import { TypeStage } from 'src/app/demandestage/demande.model';

@Component({
  selector: 'app-workflow-management',
  templateUrl: './workflow-management.component.html',
  styleUrls: ['./workflow-management.component.css']
})
export class WorkflowManagementComponent implements OnInit {
  workflowDefinitions: WorkflowDefinition[] = [];
  loading = true;
  error = false;
  importJsonModalVisible = false;
  jsonImportText = '';
  importError = '';

  instantiateModalVisible = false;
  selectedWorkflow: WorkflowDefinition | null = null;
  instantiateForm: FormGroup;
  instantiating = false;
  instantiateError = '';
  instantiateSuccess = '';
  
  selectedStageType: string = '';
  availableStages: TypeStage[] = [];

  searchQuery: string = '';
  selectedStatus: string = '';
  selectedType: string = '';
  stageTypes: string ='';
  workflows: WorkflowDefinition[] = [];  // Liste complète des workflows
  filteredWorkflows: WorkflowDefinition[] = []; 



  public breadcrumb: any;



  
  
  constructor(
    private workflowService: WorkflowService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.instantiateForm = this.fb.group({
      variables: this.fb.control('{}')
    });
  }
  
  ngOnInit(): void {
    this.loadWorkflowDefinitions();
    this.filteredWorkflows = [...this.workflows];  // Initialiser avec tous les workflows


    this.breadcrumb = {
      'mainlabel': 'Workflow ',
      'links': [
        {
          title: 'Management',
           isLink: true, link: '/workflows/workflowss' 
        },
        {
          title: 'Ajout Campagne',
          'isLink': false        },
      ]
    };

  }


  
  
  loadWorkflowDefinitions(): void {
    this.loading = true;
    this.error = false;
    
    this.workflowService.getAllWorkflowDefinitions().subscribe({
      next: (definitions) => {
        this.workflowDefinitions = definitions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading workflow definitions:', err);
        this.error = true;
        this.loading = false;
      }
    });


  }
    

  filterWorkflows() {
    // Filtrer uniquement par le nom
    this.filteredWorkflows = this.workflows.filter(workflow => 
      workflow.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  
  goToDashboard() {
    window.location.href = 'http://localhost:4200/dashboard/hospital';
  }
  
  
  createNewWorkflow(): void {
    this.router.navigate(['/workflows/designer/new']);
  }
  
  editWorkflow(id: string): void {
    this.router.navigate(['/workflows/designer', id]);
  }
  
  deleteWorkflow(id: string, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this workflow?')) {
      this.workflowService.deleteWorkflowDefinition(id).subscribe({
        next: () => {
          this.workflowDefinitions = this.workflowDefinitions.filter(w => w.id !== id);
        },
        error: (err) => {
          console.error('Error deleting workflow:', err);
          alert('Failed to delete workflow');
        }
      });
    }
  }
  
  deployWorkflow(workflow: WorkflowDefinition, event: Event): void {
    event.stopPropagation();
    
    this.workflowService.deployWorkflow(workflow.id).subscribe({
      next: (deployed) => {
        alert('Workflow deployed successfully');
     
        const index = this.workflowDefinitions.findIndex(w => w.id === workflow.id);
        if (index !== -1) {
          this.workflowDefinitions[index] = deployed;
        }
      },
      error: (err) => {
        console.error('Error deploying workflow:', err);
        alert('Failed to deploy workflow');
      }
    });
  }
  
  exportWorkflow(workflow: WorkflowDefinition, event: Event): void {
    event.stopPropagation();
    
    const jsonStr = this.workflowService.exportWorkflowToJson(workflow);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name}-${workflow.version || 'v1'}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  
  openImportModal(): void {
    this.importJsonModalVisible = true;
    this.jsonImportText = '';
    this.importError = '';
  }
  
  closeImportModal(): void {
    this.importJsonModalVisible = false;
  }
  
  handleFileInput(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.jsonImportText = e.target?.result as string;
    };
    reader.readAsText(file);
  }
  
  importWorkflow(): void {
    this.importError = '';
    
    try {
      const workflowDefinition: WorkflowDefinition = JSON.parse(this.jsonImportText);
      
      if (!workflowDefinition.name) {
        throw new Error('Invalid workflow definition: missing required fields');
      }
      
      this.workflowService.createWorkflowDefinition(workflowDefinition).subscribe({
        next: (savedWorkflow) => {
          this.workflowDefinitions.push(savedWorkflow);
          this.closeImportModal();
          alert('Workflow imported successfully');
        },
        error: (err) => {
          console.error('Error saving imported workflow:', err);
          this.importError = 'Failed to save imported workflow';
        }
      });
    } catch (error) {
      console.error('Error importing workflow:', error);
      this.importError = error instanceof Error ? error.message : 'Invalid workflow definition';
    }
  }
  

  openInstantiateModal(workflow: WorkflowDefinition, event: Event): void {
    event.stopPropagation();
    this.selectedWorkflow = workflow;
    this.instantiateModalVisible = true; 
    this.instantiateError = '';
    this.instantiateSuccess = '';
    

    const defaultVars = {
      requestType: "Test request type ( i.e Approval or something )",
      priority: "Low high etc",
      department: "IT, DEV, HR etc",
    };
    this.instantiateForm.get('variables')?.setValue(JSON.stringify(defaultVars, null, 2));
  }
  
  closeInstantiateModal(): void {
    this.instantiateModalVisible = false;
    this.selectedWorkflow = null;
  }
  
  instantiateWorkflow(): void {
    if (!this.selectedWorkflow) return;
    
    this.instantiating = true;
    this.instantiateError = '';
    this.instantiateSuccess = '';
    
    try {
      const variables = JSON.parse(this.instantiateForm.get('variables')?.value || '{}');
      
      this.workflowService.createWorkflowInstance(
        this.selectedWorkflow.id, 
        variables
      ).subscribe({
        next: (response) => {
          this.instantiating = false;
          this.instantiateSuccess = `Workflow instance created successfully with ID: ${response.id}`;
         
          setTimeout(() => {
            this.closeInstantiateModal();
           
          }, 2000);
        },
        error: (err) => {
          console.error('Error creating workflow instance:', err);
          this.instantiating = false;
          this.instantiateError = 'Failed to create workflow instance: ' + 
            (err.error?.message || err.message || 'Unknown error');
        }
      });
    } catch (error) {
      console.error('Error parsing variables:', error);
      this.instantiating = false;
      this.instantiateError = 'Invalid JSON format for variables';
    }
  }
  
  formatVariables(): void {
    try {
      const variables = JSON.parse(this.instantiateForm.get('variables')?.value || '{}');
      this.instantiateForm.get('variables')?.setValue(JSON.stringify(variables, null, 2));
      this.instantiateError = '';
    } catch (error) {
      this.instantiateError = 'Invalid JSON format for variables';
    }
  }
 
  getStatusClass(status: string | undefined): string {
    if (!status) return 'draft';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'active'; 
      case 'draft':
        return 'draft';
      case 'deprecated':
        return 'deprecated';
    
      default:
        return 'draft';
    }
  }

  goToWorkflowInstances(): void {
    this.router.navigate(['/workflow-instances']);
  }
  
  goToWorkflowInstancesByDefintion(id: string): void {
    this.router.navigate(['/workflow-instances'], { queryParams: { definitionId: id } });
  }



  

  
  
  

  
}