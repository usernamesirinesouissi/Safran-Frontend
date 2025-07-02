import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnd } from '@angular/cdk/drag-drop';

import { v4 as uuidv4 } from 'uuid';
import { ValidationModalComponent } from '../validation-modal/validation-modal.component';

import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { WorkflowService } from 'src/app/_services/workflow.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NodeType, NodeTypeDefinition, Role, User, ValidationTypeDefinition, WorkflowConnection, WorkflowDefinition, WorkflowNode } from 'src/app/_api/_models/workflow.model';
import { TypeStage } from 'src/app/demandestage/demande.model';

@Component({
  selector: 'app-workflow-designer',
  templateUrl: './workflow-designer.component.html',
  styleUrls: ['./workflow-designer.component.css']
})
export class WorkflowDesignerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasElement: ElementRef;
  
  availableNodes: Partial<WorkflowNode>[] = [];
  nodeTypes: NodeTypeDefinition[] = [];

  availableStages: TypeStage[] = []; // Stocke les types de stages récupérés du backend
  //selectedStageType: string = ''; 
  selectedStageType: { nomTypeStage: string } | null = null;
  users: User[] = []; // Liste complète des utilisateurs
  roles: Role[] = []; // Liste complète des rôles

  validationTypes: ValidationTypeDefinition[] = [
   ];
  
  workflowDefinition: WorkflowDefinition = {
    key: '',
    name: '',

    description: '',
    nodes: [],
    connections: [],
    metadata: {},
  };

  selectedNode: WorkflowNode | null = null;
  selectedConnection: WorkflowConnection | null = null;
  connecting = false;
  sourceNode: WorkflowNode | null = null;
  canvasRect: DOMRect;
  
  saving = false;
  validating = false;
  validationErrors: string[] = [];
  
  isNew = true;
  unsavedChanges = false;
  autoSave = new Subject<void>();
  private destroy$ = new Subject<void>();
  
  NodeType = NodeType;


  nodeTypeConfig = {
    [NodeType.START]: { color: '#4CAF50', icon: 'play_circle', label: 'Start' },
    [NodeType.END]: { color: '#F44336', icon: 'stop_circle', label: 'End' },
    [NodeType.VALIDATION]: { color: '#2196F3', icon: 'check_circle', label: 'Validation' },
    //[NodeType.TASK]: { color: '#FFC107', icon: 'assignment', label: 'Task' }

  };


  public breadcrumb: any;

  
  constructor(
    private workflowService: WorkflowService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal

  ) {}

  ngOnInit(): void {

    this.loadStageTypes();


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

    this.autoSave.pipe(
      debounceTime(2000),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if ( this.workflowDefinition.name) {
        this.saveWorkflow(false);
      }
    });
  

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id && id !== 'new') {
        this.isNew = false;
        this.loadWorkflowDefinition(id);
      } else if (id === 'new') {
        this.initializeNewWorkflow();
      }
    });
    
   
    this.loadNodeTypes();
  
   

    console.log(this.validationTypes);
    this.checkshit();
  }

  loadStageTypes() {
    this.workflowService.getStageTypes().subscribe((stages: TypeStage[]) => {
      this.availableStages = stages;
    });
  }

  // Ajouter un type de stage sélectionné
  addStageType() {
    if (!this.workflowDefinition.typeStages) {
      this.workflowDefinition.typeStages = []; 
    }
  
    const selectedStage = this.availableStages.find(stage => stage.id === +this.selectedStageType);
  
    if (selectedStage && !this.workflowDefinition.typeStages.some(stage => stage.id === selectedStage.id)) {
      this.workflowDefinition.typeStages.push(selectedStage);
    }
  }
  

  removeStageType(stage: TypeStage) {
    this.workflowDefinition.typeStages = this.workflowDefinition.typeStages.filter(s => s.id !== stage.id);
  }
  
  

  checkshit() {
    console.log('Validation Types after init:', this.validationTypes);
  }

  
  /*addNodeValidation() {
    if (!this.selectedNode) {
      return;
    }
  
    if (this.selectedNode.type === 'START' || this.selectedNode.type === 'END') {
      alert('Start and End nodes cannot have validations.');
      return;
    }
  
  
  
    const modalRef = this.modalService.open(ValidationModalComponent, { size: 'lg' });
    modalRef.componentInstance.nodeId = this.selectedNode.id;
    
 
    modalRef.componentInstance.validationAdded.subscribe((validation: any) => {
      if (!this.selectedNode.validations) {
        this.selectedNode.validations = [];
      }
      
      this.selectedNode.validations.push(validation);
      this.markUnsaved();
    });
  }*/

    addNodeValidation() {
      const modalRef = this.modalService.open(ValidationModalComponent, { size: 'lg' });
    
      modalRef.componentInstance.validationAdded.subscribe((validation: any) => {
        console.log('Validation Received:', validation); // Ajouté
    
        const newValidation = {
          id: uuidv4(),
          name: validation.name,
          severity: validation.severity,
          assignedRole: validation.assignedRole ? { 
            id: validation.assignedRole, 
          } : null,
          assignedUser: validation.assignedUser ? { 
            id: validation.assignedUser
          } : null,
          parameters: {
            description: validation.parameters.description || 'No description', 
            required: validation.parameters.required || false,
            timeoutMinutes: validation.parameters.timeoutMinutes || 1440,
            formTemplate: validation.parameters.formTemplate || '',
            validationType: validation.parameters.validationType || 'BASIC'
          },
          validatorType: validation.validatorType || 'APPROVAL'
        };
    
        console.log('New Validation:', newValidation); // Ajouté
        this.selectedNode.validations.push(newValidation);
        this.markUnsaved();
      });
    }

    
  
  initializeNewWorkflow(): void {

    const startNodeConfig = this.nodeTypeConfig[NodeType.START];
    const startNode: WorkflowNode = {
      id: `node_${uuidv4().replace(/-/g, '_')}`,
      type: 'START',
      name: 'Start',
      description: 'Workflow starting point',
      properties: {},
      position: {
        x: 50,
        y: 100
      },
      style: {
        color: startNodeConfig.color,
        icon: startNodeConfig.icon
      },
      validations: []
    };
    this.workflowDefinition.nodes.push(startNode);
    this.markUnsaved();
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
    }, 0);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadNodeTypes(): void {
    this.workflowService.getAvailableNodeTypes().subscribe({
      next: (types) => {
        this.nodeTypes = types;
        

        this.availableNodes = Object.values(NodeType)
          .filter(type => typeof type === 'string')
          .map(type => {
            const nodeType = type as string;
            const config = this.nodeTypeConfig[nodeType as unknown as NodeType];
            return {
              type: nodeType,
              name: config?.label || nodeType,
              style: {
                color: config?.color || '#757575',
                icon: config?.icon || 'circle'
              }
            };
          });
        

        const validationSet = new Set<ValidationTypeDefinition>();
        this.nodeTypes.forEach(nodeType => {
          if (nodeType.validations) {
            nodeType.validations.forEach(validationType => {
              validationSet.add(validationType);
            });
          }
        });
        
        this.validationTypes = Array.from(validationSet);
        

        
        if (this.isNew && this.workflowDefinition.nodes.length === 0) {
          this.initializeNewWorkflow();
        }
      },
      error: (err) => {
        console.error('Error loading node types:', err);
      }
    });
  }
  
  loadWorkflowDefinition(id: string): void {
    this.workflowService.getWorkflowDefinitionById(id).subscribe({
      next: (definition) => {
        this.workflowDefinition = definition;
        console.log('Loaded workflow definition:', this.workflowDefinition);
        

        this.workflowDefinition.nodes.forEach(node => {
          const config = this.nodeTypeConfig[node.type as unknown as NodeType];
          if (config && (!node.style || !node.style.color)) {
            node.style = {
              ...node.style,
              color: config.color,
              icon: config.icon
            };
          }
        });
        
        this.unsavedChanges = false;
      },
      error: (err) => {
        console.error(`Error loading workflow definition ${id}:`, err);
        alert('Failed to load workflow definition');
        this.router.navigate(['/workflows']);
      }
    });
  }
  
  onDrop(event: CdkDragDrop<any[]>) {
    if (!event.previousContainer || !event.container) return;


    this.canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();

    if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
        const template = event.previousContainer.data[event.previousIndex];


        const xPos = event.dropPoint.x - this.canvasRect.left;
        const yPos = event.dropPoint.y - this.canvasRect.top;


        if ((template.type === 'START' && this.hasNodeOfType('START')) ||
            (template.type === 'END' && this.hasNodeOfType('END'))) {
            alert(`A workflow can only have one ${template.type} node.`);
            return;
        }

        const newNode: WorkflowNode = {
            id: `node_${uuidv4().replace(/-/g, '_')}`,
            type: template.type,
            name: template.name,
            description: '',
            properties: {},
            position: {
                x: xPos,
                y: yPos
            },
            style: template.style,
            validations: []
        };


        this.workflowDefinition.nodes.push(newNode);
        this.markUnsaved();
    }
  }
  
  hasNodeOfType(type: string): boolean {
    return this.workflowDefinition.nodes.some(node => node.type === type);
  }

  selectNode(node: WorkflowNode, event: MouseEvent) {
    event.stopPropagation(); 
    this.selectedConnection = null;
    this.selectedNode = node;
    
    if (this.connecting) {
      if (this.sourceNode && this.sourceNode.id !== node.id) {

        if (node.type === 'START') {
          alert('Cannot connect to a Start node.');
          this.connecting = false;
          this.sourceNode = null;
          return;
        }
        

        if (this.sourceNode.type === 'END') {
          alert('Cannot connect from an End node.');
          this.connecting = false;
          this.sourceNode = null;
          return;
        }
        
        const connection: WorkflowConnection = {
          id: `conn_${uuidv4().replace(/-/g, '_')}`,
          sourceId: this.sourceNode.id,
          targetId: node.id,
          name: ''
        };
        
        if (!this.workflowDefinition.connections) {
          this.workflowDefinition.connections = [];
        }

        const connectionExists = this.workflowDefinition.connections.some(
          conn => conn.sourceId === connection.sourceId && conn.targetId === connection.targetId
        );

        if (!connectionExists) {
          this.workflowDefinition.connections.push(connection);
          this.markUnsaved();
        }

        this.connecting = false;
        this.sourceNode = null;
      }
    }
  }

  startConnecting(node: WorkflowNode, event: MouseEvent) {
    event.stopPropagation(); 
    
    if (node.type === 'END') {
      alert('Cannot create connections from an End node.');
      return;
    }
    
    this.connecting = true;
    this.sourceNode = node;
  }
  
  onNodeDragEnded(event: CdkDragEnd, node: WorkflowNode) {
    const dragDistance = event.distance;
    node.position = {
      x: node.position.x + dragDistance.x,
      y: node.position.y + dragDistance.y
    };
    this.markUnsaved();
  }

  selectConnection(connection: WorkflowConnection, event: MouseEvent) {
    event.stopPropagation();
    this.selectedNode = null; 
    this.selectedConnection = connection;
  }
  
  deselectAll() {
    this.selectedNode = null;
    this.selectedConnection = null;
    if (this.connecting) {
      this.connecting = false;
      this.sourceNode = null;
    }
  }

  updateNodeProperties() {
      console.log('Node properties updated');

    this.markUnsaved();
  }
  
  updateConnectionName() {

    this.markUnsaved();
  }

  getConnectionsWithNodes() {
    if (!this.workflowDefinition.connections || !this.workflowDefinition.nodes) {
      return [];
    }

    return this.workflowDefinition.connections.map(conn => {
      const sourceNode = this.workflowDefinition.nodes.find(n => n.id === conn.sourceId);
      const targetNode = this.workflowDefinition.nodes.find(n => n.id === conn.targetId);
      return { ...conn, sourceNode, targetNode };
    });
  }

  generatePathData(sourcePosition: { x: number, y: number }, targetPosition: { x: number, y: number }): string {
    const nodeWidth = 100;
    const nodeHeight = 80;
    
    const sourceX = sourcePosition.x + nodeWidth / 2;
    const sourceY = sourcePosition.y + nodeHeight / 2;
    const targetX = targetPosition.x + nodeWidth / 2;
    const targetY = targetPosition.y + nodeHeight / 2;
    
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 100) {
      return `M${sourceX},${sourceY} L${targetX},${targetY}`;
    }
    
    let sourceConnX, sourceConnY, targetConnX, targetConnY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      sourceConnX = dx > 0 ? sourcePosition.x + nodeWidth : sourcePosition.x;
      sourceConnY = sourcePosition.y + nodeHeight / 2;
    } else {
      sourceConnX = sourcePosition.x + nodeWidth / 2;
      sourceConnY = dy > 0 ? sourcePosition.y + nodeHeight : sourcePosition.y;
    }
    
    if (Math.abs(dx) > Math.abs(dy)) {
      targetConnX = dx > 0 ? targetPosition.x : targetPosition.x + nodeWidth;
      targetConnY = targetPosition.y + nodeHeight / 2;
    } else {
      targetConnX = targetPosition.x + nodeWidth / 2;
      targetConnY = dy > 0 ? targetPosition.y : targetPosition.y + nodeHeight;
    }
    
    const controlPointX1 = sourceConnX + (targetConnX - sourceConnX) * 0.4;
    const controlPointY1 = sourceConnY;
    const controlPointX2 = sourceConnX + (targetConnX - sourceConnX) * 0.6;
    const controlPointY2 = targetConnY;
    
    return `M${sourceConnX},${sourceConnY} C${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${targetConnX},${targetConnY}`;
  }

  calculateConnectionLabelPosition(sourcePosition: { x: number, y: number }, targetPosition: { x: number, y: number }) {
    const nodeWidth = 100;
    const nodeHeight = 80;
    
    const midX = (sourcePosition.x + targetPosition.x + nodeWidth) / 2;
    const midY = (sourcePosition.y + targetPosition.y + nodeHeight) / 2;
    
    return { x: midX, y: midY };
  }

  validateWorkflowBeforeSaving(): boolean {
    const errors: string[] = [];
    

    if (!this.hasNodeOfType('START')) {
      errors.push('Workflow must have a Start node.');
    }
    

    if (!this.hasNodeOfType('END')) {
      errors.push('Workflow must have an End node.');
    }
    

    const startNode = this.workflowDefinition.nodes.find(node => node.type === 'START');
    if (startNode) {
      const startHasOutgoing = this.workflowDefinition.connections.some(conn => conn.sourceId === startNode.id);
      if (!startHasOutgoing) {
        errors.push('Start node must have at least one outgoing connection.');
      }
    }
    

    const endNode = this.workflowDefinition.nodes.find(node => node.type === 'END');
    if (endNode) {
      const endHasIncoming = this.workflowDefinition.connections.some(conn => conn.targetId === endNode.id);
      if (!endHasIncoming) {
        errors.push('End node must have at least one incoming connection.');
      }
    }
    

    const validationNodes = this.workflowDefinition.nodes.filter(node => node.type === 'VALIDATION');
    validationNodes.forEach(node => {
     console.log(node);
      if (!node.validations || node.validations.length === 0) {
        errors.push(`Validation node "${node.name}" must have at least one validation defined.`);
      }
    });
    
    if (errors.length > 0) {
      this.validationErrors = errors;
      alert('Workflow validation failed:\n' + errors.join('\n'));
      return false;
    }
    
    return true;
  }

 /*saveWorkflow(showMessages = true) {
    if (!this.workflowDefinition.name) {
      if (showMessages) {
        alert('Please provide name for the workflow');
      }
      return;
    }
    

    if (!this.validateWorkflowBeforeSaving()) {
      return;
    }
    
    this.saving = true;
    console.log(this.workflowDefinition);
    
    this.workflowService.createWorkflowDefinition(this.workflowDefinition).subscribe({
      next: (savedDefinition) => {
        this.workflowDefinition = savedDefinition;
        this.unsavedChanges = false;
        this.saving = false;
        
        if (this.isNew) {
          this.isNew = false;
          this.router.navigate(['/workflows/designer', savedDefinition.id], { replaceUrl: true });
        }
        
        if (showMessages) {
          alert('Workflow saved successfully');
        }
      },
      error: (err) => {
        console.error('Error saving workflow definition:', err);
        this.saving = false;
        
        if (showMessages) {
          alert('Failed to save workflow: ' + (err.message || 'Unknown error'));
        }
      }
    });
  }*/
    saveWorkflow(showMessages = true) {
      if (!this.workflowDefinition.name) {
        if (showMessages) {
          alert('Veuillez fournir un nom pour le workflow.');
        }
        return;
      }
    
      if (!this.workflowDefinition.typeStages || this.workflowDefinition.typeStages.length === 0) {
        if (showMessages) {
          alert('Veuillez ajouter au moins un type de stage avant d\'enregistrer.');
        }
        return;
      }
    
      if (!this.validateWorkflowBeforeSaving()) {
        return;
      }
    
      const validationErrors: string[] = [];
      this.workflowDefinition.nodes.forEach(node => {
        if (node.type === 'VALIDATION') {
          node.validations?.forEach(validation => {
            if (!validation.name || !validation.severity) {
              validationErrors.push(`Validation invalide dans le nœud "${node.name}"`);
            }
          });
        }
      });
    
      if (validationErrors.length > 0) {
        if (showMessages) {
          alert('Erreurs de validation :\n' + validationErrors.join('\n'));
        }
        return;
      }
    
      this.saving = true;
      console.log('Données à sauvegarder :', this.workflowDefinition);
    
      this.workflowService.createWorkflowDefinition(this.workflowDefinition).subscribe({
        next: (savedDefinition) => {
          this.workflowDefinition = savedDefinition;
          this.unsavedChanges = false;
          this.saving = false;
    
          if (this.isNew) {
            this.isNew = false;
            this.router.navigate(['/workflows/designer', savedDefinition.id], { replaceUrl: true });
          }
    
          if (showMessages) {
            alert('Workflow enregistré avec succès !');
          }
        },
        error: (err) => {
          console.error('Erreur lors de l\'enregistrement du workflow :', err);
          this.saving = false;
    
          if (showMessages) {
            alert('Échec de l\'enregistrement du workflow : ' + (err.message || 'Erreur inconnue'));
          }
        }
      });
    }
    
   

  
  deployWorkflow() {
    if (!this.workflowDefinition.id) {
      alert('Please save the workflow before deploying');
      return;
    }
    
    this.workflowService.deployWorkflow(this.workflowDefinition.id).subscribe({
      next: () => {
        alert('Workflow deployed successfully');
      },
      error: (err) => {
        console.error('Error deploying workflow:', err);
        alert('Failed to deploy workflow: ' + (err.message || 'Unknown error'));
      }
    });
  }
  
  saveAndDeployWorkflow() {
    this.saveWorkflow(false);

    if (this.validationErrors.length === 0) {
      this.deployWorkflow();
    }
  }
  
  exportWorkflow() {
  
    
    const jsonStr = this.workflowService.exportWorkflowToJson(this.workflowDefinition);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.workflowDefinition.name}-${this.workflowDefinition.version || 'v1'}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  
  deleteSelectedNode() {
    if (!this.selectedNode) return;
    

    if (this.selectedNode.type === 'START' && !this.isNew) {
      alert('Cannot delete the Start node in an existing workflow.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this node?')) {
 
      this.workflowDefinition.connections = this.workflowDefinition.connections.filter(
        conn => conn.sourceId !== this.selectedNode.id && conn.targetId !== this.selectedNode.id
      );
      

      this.workflowDefinition.nodes = this.workflowDefinition.nodes.filter(
        node => node.id !== this.selectedNode.id
      );
      
      this.selectedNode = null;
      this.markUnsaved();
    }
  }
  
  deleteConnection(connection: WorkflowConnection, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    
    if (confirm('Are you sure you want to delete this connection?')) {
      this.workflowDefinition.connections = this.workflowDefinition.connections.filter(
        conn => conn.id !== connection.id
      );
      
      if (this.selectedConnection?.id === connection.id) {
        this.selectedConnection = null;
      }
      
      this.markUnsaved();
    }
  }
  

  
    removeNodeValidation(validationId: string) {
      if (!this.selectedNode || !this.selectedNode.validations) return;
      
      if (confirm('Are you sure you want to remove this validation?')) {
        this.selectedNode.validations = this.selectedNode.validations.filter(
          v => v.id !== validationId
        );
        
        this.markUnsaved();
      }
    }

   
  
  markUnsaved() {
    this.unsavedChanges = true;
    this.autoSave.next();
  }
  
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.unsavedChanges) {
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return false;
    }
    return true;
  }
  
  goBack() {
    if (this.unsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/workflows']);
      }
    } else {
      this.router.navigate(['/workflows']);
    }
  }

  getNodeTypeProperties(nodeType: NodeTypeDefinition): string[] {
    return nodeType && nodeType.properties ? nodeType.properties.map(prop => prop.name) : [];
  }
  
  isValidationNodeType(node: WorkflowNode): boolean {
    return node && node.type === 'VALIDATION';
  }
  
  getNodeClass(node: WorkflowNode): string {
    let classes = 'workflow-node';
    
    if (node.type === 'START') {
      classes += ' start-node';
    } else if (node.type === 'END') {
      classes += ' end-node';
    } else if (node.type === 'VALIDATION') {
      classes += ' validation-node';
    } /*else if (node.type === 'TASK') {
      classes += ' task-node';
    }*/
    
    if (this.selectedNode && this.selectedNode.id === node.id) {
      classes += ' selected';
    }
    
    return classes;
  }
  
  getNodeIcon(nodeType: string): string {
    const config = this.nodeTypeConfig[nodeType as unknown as NodeType];
    return config?.icon || 'circle';
  }
  
  getNodeColor(nodeType: string): string {
    const config = this.nodeTypeConfig[nodeType as unknown as NodeType];
    return config?.color || '#757575';
  }
  
  getNodeLabel(nodeType: string): string {
    const config = this.nodeTypeConfig[nodeType as unknown as NodeType];
    return config?.label || nodeType;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.canvasRect = this.canvasElement.nativeElement.getBoundingClientRect();
  }

  getUserNameById(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : 'Utilisateur inconnu';
  }
  
  getRoleNameById(roleId: number): string {
    if (!this.roles) return 'Chargement...';
    const role = this.roles.find(r => r.id === roleId);
    return role?.name || `Rôle inconnu (ID: ${roleId})`;
  }
}