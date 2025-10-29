import apiClient from '../client';

export interface Plot {
  id: number;
  name: string;
  parent_plot: number | null;
  parent_plot_name: string | null;
  hierarchy_display: string;
  location: string;
  size_sqft: number | null;
  grass_type: string;
  notes: string;
  polygon_coordinates: any | null;
  center_lat: number | null;
  center_lng: number | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_name: string;
  treatment_count: number;
  subplot_count: number;
}

export interface Location {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface GrassType {
  id: number;
  name: string;
  scientific_name: string;
  description: string;
  created_at: string;
}

export interface ProductName {
  id: number;
  name: string;
  category: 'fertilizer' | 'chemical';
  description: string;
  created_at: string;
}

export interface WaterDetails {
  amount_inches: number;
  duration_minutes?: number;
  method?: string;
}

export interface FertilizerDetails {
  product_name: string;
  npk_ratio?: string;
  amount: number;
  amount_unit: string;
  rate_per_1000sqft?: number;
}

export interface ChemicalDetails {
  chemical_type: 'herbicide' | 'insecticide' | 'fungicide' | 'growth_regulator' | 'other';
  product_name: string;
  active_ingredient?: string;
  amount: number;
  amount_unit: string;
  rate_per_1000sqft?: number;
  target_pest?: string;
}

export interface MowingDetails {
  height_inches: number;
  clippings_removed: boolean;
  mower_type?: string;
  pattern?: string;
}

export interface Treatment {
  id: number;
  plots: number[];
  plot_names: string[];
  treatment_type: 'water' | 'fertilizer' | 'chemical' | 'mowing';
  date: string;
  time?: string;
  notes: string;
  applied_by: number | null;
  applied_by_name: string;
  created_at: string;
  updated_at: string;
  water_details?: WaterDetails;
  fertilizer_details?: FertilizerDetails;
  chemical_details?: ChemicalDetails;
  mowing_details?: MowingDetails;
}

export interface CreatePlotData {
  name: string;
  parent_plot?: number | null;
  location?: string;
  size_sqft?: number;
  grass_type?: string;
  notes?: string;
  polygon_coordinates?: any;
  center_lat?: number;
  center_lng?: number;
}

export interface CreateTreatmentData {
  plots: number[];
  treatment_type: 'water' | 'fertilizer' | 'chemical' | 'mowing';
  date: string;
  time?: string;
  notes?: string;
  water_details?: WaterDetails;
  fertilizer_details?: FertilizerDetails;
  chemical_details?: ChemicalDetails;
  mowing_details?: MowingDetails;
}

const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return '';
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const turfResearchApi = {
  // Plot endpoints
  getPlots: (params?: { parent_only?: boolean; parent_plot?: number }) => 
    apiClient.get<Plot[]>(`/turf-research/plots/${buildQueryString(params)}`),
  
  getPlot: (id: number) => 
    apiClient.get<Plot>(`/turf-research/plots/${id}/`),
  
  createPlot: (data: CreatePlotData) => 
    apiClient.post<Plot>('/turf-research/plots/', data),
  
  updatePlot: (id: number, data: Partial<CreatePlotData>) => 
    apiClient.patch<Plot>(`/turf-research/plots/${id}/`, data),
  
  deletePlot: (id: number) => 
    apiClient.delete(`/turf-research/plots/${id}/`),

  getPlotTreatmentHistory: (id: number) =>
    apiClient.get<Treatment[]>(`/turf-research/plots/${id}/treatment_history/`),
  
  getPlotSubplots: (id: number) =>
    apiClient.get<Plot[]>(`/turf-research/plots/${id}/subplots/`),
  
  getPlotHierarchy: (id: number) =>
    apiClient.get<{
      parents: Plot[];
      current: Plot;
      subplots: Plot[];
      all_descendants: Plot[];
    }>(`/turf-research/plots/${id}/hierarchy/`),

  // Treatment endpoints
  getTreatments: (params?: { plot?: number; treatment_type?: string; date?: string }) => 
    apiClient.get<Treatment[]>(`/turf-research/treatments/${buildQueryString(params)}`),
  
  getTreatment: (id: number) => 
    apiClient.get<Treatment>(`/turf-research/treatments/${id}/`),
  
  createTreatment: (data: CreateTreatmentData) => 
    apiClient.post<Treatment>('/turf-research/treatments/', data),
  
  updateTreatment: (id: number, data: Partial<CreateTreatmentData>) => 
    apiClient.patch<Treatment>(`/turf-research/treatments/${id}/`, data),
  
  deleteTreatment: (id: number) => 
    apiClient.delete(`/turf-research/treatments/${id}/`),

  // Location endpoints
  getLocations: () =>
    apiClient.get<Location[]>('/turf-research/locations/'),
  
  createLocation: (data: { name: string; description?: string }) =>
    apiClient.post<Location>('/turf-research/locations/', data),
  
  updateLocation: (id: number, data: { name?: string; description?: string }) =>
    apiClient.patch<Location>(`/turf-research/locations/${id}/`, data),
  
  deleteLocation: (id: number) =>
    apiClient.delete(`/turf-research/locations/${id}/`),

  // Grass Type endpoints
  getGrassTypes: () =>
    apiClient.get<GrassType[]>('/turf-research/grass-types/'),
  
  createGrassType: (data: { name: string; scientific_name?: string; description?: string }) =>
    apiClient.post<GrassType>('/turf-research/grass-types/', data),
  
  updateGrassType: (id: number, data: { name?: string; scientific_name?: string; description?: string }) =>
    apiClient.patch<GrassType>(`/turf-research/grass-types/${id}/`, data),
  
  deleteGrassType: (id: number) =>
    apiClient.delete(`/turf-research/grass-types/${id}/`),
};
