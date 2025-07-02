import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NodeTypeDefinition, User,Role, ValidationInstance, WorkflowDefinition, WorkflowInstance, NodeValidation } from '../_api/_models/workflow.model';
import { Observable, of, throwError } from 'rxjs';
import { TypeStage } from '../demandestage/demande.model';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
 

  private baseUrl = 'http://localhost:8083/api/workflows';


  

  constructor(private http: HttpClient) {}

 
  getStageTypes(): Observable<TypeStage[]> {
  return this.http.get<TypeStage[]>('http://localhost:8083/api/type-stages');
  }


    
  /*getAllRoles(): Observable<Role[]> {
    return this.http.get<any>(`http://localhost:8083/api/roles`).pipe(
      map(response => {
        // Si la réponse est un objet avec une propriété data
        if (response && response.data) {
          return response.data.map((role: any) => ({
            id: role.id.toString(),
            name: role.name
          }));
        }
        // Si la réponse est directement un tableau
        else if (Array.isArray(response)) {
          return response.map((role: any) => ({
            id: role.id.toString(),
            name: role.name
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error loading roles', error);
        return of([]);
      })
    );
  }




  getUsersByRole(roleId: string): Observable<User[]> {
    return this.http.get<User[]>(`http://localhost:8083/api/users/by-role/{roleId}`).pipe(
      catchError(error => {
        console.error('Error loading users for role', roleId, error);
        return of([]);
      })
    );}
  
    // Alternative: Récupère par nom de rôle
    getUsersByRoleName(roleName: string): Observable<User[]> {
      return this.http.get<User[]>(`http://localhost:8083/api/users/by-role-name/{roleName}`);
    }*/
    // Récupère les utilisateurs par ID de rôle (version corrigée)
    getAllRoles(): Observable<Role[]> {
      return this.http.get<Role[] | { data: Role[] }>(`http://localhost:8083/api/roles`).pipe(
        map(response => {
          // Réponse encapsulée dans un objet { data: [...] }
          if (response && typeof response === 'object' && 'data' in response) {
            return response.data.map((role: any) => ({
              id: role.id.toString(),
              name: role.name
            }));
          }
          // Réponse directe sous forme de tableau
          else if (Array.isArray(response)) {
            return response.map((role: any) => ({
              id: role.id.toString(),
              name: role.name
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error('Error loading roles', error);
          return of([]);
        })
      );
    }
    
    getUsersByRole(roleId: number): Observable<User[]> {
      console.log('Fetching users for role ID:', roleId);
      return this.http.get<User[]>(`http://localhost:8083/api/workflows/roles/${roleId}/users`).pipe(
        tap(users => console.log('Users received:', users)),
        catchError(error => {
          console.error('API Error:', error);
          return throwError(error);
        })
      );
    }

  exportWorkflowToJson(workflowDefinition: WorkflowDefinition): string {
    return JSON.stringify(workflowDefinition);
  }
  validateWorkflow(workflowDefinition: WorkflowDefinition): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/validate`, workflowDefinition);
  }
  getAvailableNodeTypes(): Observable<NodeTypeDefinition[]> {
    console.log("getAvailableNodeTypes");
    this.http.get<NodeTypeDefinition[]>(`${this.baseUrl}/node-types`).subscribe(result => {
      console.log(result);
    });
    return this.http.get<NodeTypeDefinition[]>(`${this.baseUrl}/node-types`);
  }

  getAllWorkflowDefinitions(): Observable<WorkflowDefinition[]> {
    return this.http.get<WorkflowDefinition[]>(`${this.baseUrl}/definitions`);
  }

  getWorkflowDefinitionById(id: string): Observable<WorkflowDefinition> {
    return this.http.get<WorkflowDefinition>(`${this.baseUrl}/definitions/${id}`);
  }


    // workflow.service.ts

/*createWorkflowDefinition(workflowDef: WorkflowDefinition): Observable<WorkflowDefinition> {
  const workflowToSend = {
    ...workflowDef,
    nodes: workflowDef.nodes.map(node => ({
      ...node,
      validations: node.validations?.map(validation => ({
        id: validation.id,
        name: validation.name,
        severity: validation.severity,
        assignedRole: validation.assignedRole ? {
          id: validation.assignedRole.id,
        } : null,
        assignedUser: validation.assignedUser ? {
          id: validation.assignedUser.id
        } : null,
        parameters: validation.parameters || {}
      })) || []
    }))
  };

  return this.http.post<WorkflowDefinition>(`${this.baseUrl}/definitions`, workflowToSend);
}*/
createWorkflowDefinition(workflowDef: WorkflowDefinition): Observable<WorkflowDefinition> {

  const workflowToSend = JSON.parse(JSON.stringify(workflowDef));
  

  workflowToSend.nodes.forEach(node => {
    if (node.hasOwnProperty('properties')) {
      delete node.properties;
    }
    if (node.hasOwnProperty('metadata')) {
      delete node.metadata;
    }
    if (node.validations && node.validations.length > 0) {

      node.validations = node.validations.map(validation => ({
        id: validation.id,
        name: validation.name,
        parameters: validation.parameters || {},
        assignedRole: validation.assignedRole ? {
          id: validation.assignedRole.id,
        } : null,
        assignedUser: validation.assignedUser ? {
          id: validation.assignedUser.id
        } : null,
        severity: validation.severity || 'WARNING'
      }));
    }
  });
  
  return this.http.post<WorkflowDefinition>(`${this.baseUrl}/definitions`, workflowToSend);
}


  updateWorkflowDefinition(id: string, definition: WorkflowDefinition): Observable<WorkflowDefinition> {
    return this.http.put<WorkflowDefinition>(`${this.baseUrl}/definitions/${id}`, definition);
  }

  deleteWorkflowDefinition(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/definitions/${id}`);
  }

  deployWorkflow(id: string): Observable<WorkflowDefinition> {
    return this.http.post<WorkflowDefinition>(`${this.baseUrl}/definitions/${id}/deploy`, {});
  }

  
  startWorkflow(definitionId: string, initiatedBy: string, variables: { [key: string]: string }): Observable<WorkflowInstance> {
    return this.http.post<WorkflowInstance>(`${this.baseUrl}/instances`, { definitionId, initiatedBy, variables });
  }

 
  getPendingValidations(role: string): Observable<ValidationInstance[]> {
    return this.http.get<ValidationInstance[]>(`${this.baseUrl}/validations`, { params: { role } });
  }

  getUserValidations(userId: string): Observable<ValidationInstance[]> {
    return this.http.get<ValidationInstance[]>(`${this.baseUrl}/validations/user/${userId}`);
  }

  
  getAllWorkflowInstances(): Observable<WorkflowInstance[]> {
    return this.http.get<WorkflowInstance[]>(`${this.baseUrl}/instances`);
  }
  
  getWorkflowInstanceById(id: string): Observable<WorkflowInstance> {
    return this.http.get<WorkflowInstance>(`${this.baseUrl}/instances/${id}`);
  }
  

  cancelWorkflowInstance(id: string): Observable<WorkflowInstance> {
    return this.http.post<WorkflowInstance>(`${this.baseUrl}/instances/${id}/cancel`, {});
  }

  exportWorkflowInstanceToJson(instance: WorkflowInstance): string {
    return JSON.stringify(instance, null, 2);
  }

  getWorkflowInstancesByDefinitionId(definitionId: string): Observable<WorkflowInstance[]> {
    return this.http.get<WorkflowInstance[]>(`${this.baseUrl}/instances/definition/${definitionId}`,{} );
  }

  createWorkflowInstance(definitionId: string, variables: any): Observable<any> {
    const payload = {
      ...variables,
  
    };
    console.log("createWorkflowInstance");
    console.log(payload);
    
    return this.http.post<any>(`${this.baseUrl}/instances`, payload, {
      params: { definitionId, initiatedBy: localStorage.getItem('userId') || 'user' }
    });
  }

 
completeValidation(validationId: string, decision: string, decisionBy: string, comments: string): Observable<any> {
  const url = `${this.baseUrl}/validations/${validationId}/complete`;
  const params = new HttpParams()
    .set('decision', decision)
    .set('decisionBy', decisionBy)
    .set('comments', encodeURIComponent(comments));
  
  return this.http.post(url, null, { params });
}
}