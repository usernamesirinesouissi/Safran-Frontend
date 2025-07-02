// campaign.model.ts
export interface Campaign {
    id?: number;
    typeStage: any; // Update with proper TypeStage interface if available
    startDate: string;
    endDate: string;
    academicYear: string;
    status: 'PLANNED' | 'ACTIVE' | 'COMPLETED'; // Update with actual enum values
    createdAt?: string;
    updatedAt?: string;
  }