import { TypeStage } from "src/app/demandestage/demande.model";

/*export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  }*/


// Dans validation-modal.component.ts
export interface Role {
  id: number;  // Changé de number à string pour correspondre au modèle
  name: string;
}

export interface User {
  id: number;
  username: string;  // Assurez-vous que c'est 'name' et non 'username'
  email?: string;
}
  
export interface NodeValidation {
  id?: number;
  name: string;
  severity: ValidationSeverity;
  assignedRole?: {
    id: number;
    name: string;
  };
  assignedUser?: {
    id: number;
  }; 
  parameters: {
    description: string;
    required: boolean;
    timeoutMinutes: number;
    formTemplate: string;
    validationType: string;
  };
}


  export enum NodeType {
    START = 'START',
    END = 'END',
    VALIDATION = 'VALIDATION',
  
  }
  
  export enum WorkflowStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    DEPRECATED = 'DEPRECATED',
    DELETED = 'DELETED'
  }
  
  export enum WorkflowInstanceStatus {
    CREATED = 'CREATED',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    TERMINATED = 'TERMINATED',
    ERROR = 'ERROR'
  }
  
  export enum ValidationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
  }
  export enum ValidationSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
  }
  
  export interface NodePropertyDefinition {
    name: string;
    label: string;
    type: string;
    required: boolean;
    defaultValue?: any;
    options?: any[];
  }
  
  export interface ValidationTypeDefinition {
    name: string;
    type: string;
    parameters?: NodePropertyDefinition[];
  }
  
  export interface NodeTypeDefinition {
    type: string;
    name: string;
    icon: string;
    color: string;
    properties: NodePropertyDefinition[];
    validations: ValidationTypeDefinition[];
  }
  
  export interface WorkflowNodeValidation {
    id: string;
    name: string;
    validatorType: string;
    parameters: any;
    severity: 'INFO' | 'WARNING' | 'ERROR'; 
    assignedRole?: {
      id: number;
    };
    assignedUser?: {
      id: number;
    }; 
  }
  
  export interface WorkflowNode {
    id: string;
    type: string;
    name: string;
    description: string;
    properties: any;
    position: {
      x: number;
      y: number;
    };
    style: {
      color: string;
      icon: string;
    };
    validations: WorkflowNodeValidation[];
  }
  
  export interface WorkflowConnection {
    id: string;
    sourceId: string;
    targetId: string;
    name: string;
  }
  
  export interface WorkflowDefinition {

    stageId?: string | number; // <-- Vérifie bien que ça existe
    id?: string;
    key: string;
    name: string;
    description: string;
    version?: string;
    status?: WorkflowStatus;
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
    metadata: Record<string, string>;
    typeStages?: TypeStage[];
    updatedAt?:any;
    createdAt?:any;
  }
  
  export interface WorkflowValidationResult {
    valid: boolean;
    errors: string[];
  }
  
  export interface ValidationInstance {
    id: string;
    nodeInstanceId: string;
    validationId: string;
    status: ValidationStatus;
    assignedUser?: string;
    assignedRole?: string;
    decision?: string;
    decisionBy?: string;
    createdAt: Date;
    decidedAt?: Date;
    comments?: string;
  }
  
  export interface NodeInstance {
    id: string;
    workflowInstanceId: string;
    nodeId: string;
    status: NodeInstanceStatus;
    startedAt: Date;
    completedAt?: Date;
    validationInstances?: ValidationInstance[];
    nodeName?: string;
    nodeType?: string;
  }
  
  export interface WorkflowInstance {
    id: string;
    workflowDefinitionId: string;
    workflowDefinitionKey?: string;
    workflowDefinitionName?: string;
    status: WorkflowInstanceStatus;
    startedAt: Date;
    completedAt?: Date;
    initiatedBy: string;
    nodeInstances: NodeInstance[];
    variables: Record<string, string>;
  }
  
  export enum NodeInstanceStatus {
    WAITING = 'WAITING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR'
  }
  
  
  
  /*export interface NodeValidation {
    id: string;
    name: string;
    parameters?: {
      description?: string;
      required?: boolean;
      timeoutMinutes?: number;
      formTemplate?: string;
      validationType?: string;
    };
    assignedTo?: string;
    assignedRole?: string;
    severity: ValidationSeverity;
  }*/
  
  
  