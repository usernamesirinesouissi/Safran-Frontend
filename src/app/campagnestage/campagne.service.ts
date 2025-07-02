// campagne.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campaign } from './campaign.model';
import { TypeStage } from '../demandestage/demande.model';

@Injectable({
  providedIn: 'root'
})
export class CampagneService {
  private apiUrl = 'http://localhost:8083/api';

  constructor(private http: HttpClient) { }

  getAllStages(): Observable<TypeStage[]> {
    return this.http.get<TypeStage[]>('http://localhost:8083/api/type-stages');
    }
  

// Ajouter dans campagne.service.ts
getAllCampaigns(): Observable<Campaign[]> {
  return this.http.get<Campaign[]>(`${this.apiUrl}/campaigns`);
}



  getCampaignById(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/${id}`);
  }

createCampaign(campaignData: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/campaigns`, campaignData, {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  });
}




  updateCampaign(id: number, campaign: Campaign): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/${id}`, campaign);
  }

  deleteCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  sendReminders(id: number): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.apiUrl}/${id}/send-reminders`, {});
  }
}