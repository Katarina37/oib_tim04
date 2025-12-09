export enum PlantState {
  PLANTED = "posadjena",
  HARVESTED = "ubrana",
  PROCESSED = "preradjena",
}

export interface PlantDTO {
  id: number;
  commonName: string;
  oilStrength: number;
  latinName: string;
  countryOfOrigin: string;
  state: PlantState;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePlantDTO {
  commonName: string;
  oilStrength?: number;
  latinName: string;
  countryOfOrigin: string;
}

export interface UpdatePlantDTO {
  commonName?: string;
  oilStrength?: number;
  latinName?: string;
  countryOfOrigin?: string;
  state?: PlantState;
}

export interface HarvestPlantsDTO {
  commonName: string;
  quantity: number;
}

export interface ChangeOilStrengthDTO {
  plantId: number;
  percentageChange: number;
}

export interface PlantSearchCriteriaDTO {
  commonName?: string;
  latinName?: string;
  countryOfOrigin?: string;
  state?: PlantState;
  minOilStrength?: number;
  maxOilStrength?: number;
}