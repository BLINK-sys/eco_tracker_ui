
export interface Container {
  id: string;
  number: number;
  status: 'empty' | 'partial' | 'full';
  fill_level?: number; // Уровень заполнения 0-100%
}

export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  containers: Container[];
  lastCollection?: string;
  status: 'empty' | 'partial' | 'full';
  company_id?: string;
  company?: {
    id: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export interface StatusInfo {
  label: string;
  color: string;
}

export type Period = 'day' | 'week' | 'month' | 'custom';

export interface ReportFilters {
  period: Period;
  startDate?: Date;
  endDate?: Date;
}

export interface ReportSummary {
  totalCollections: number;
  averageFillRate: number;
  fullContainers: number;
  emptyContainers: number;
}
