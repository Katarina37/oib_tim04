import { PlantState } from "../models/plants/PlantDTO";

export interface PlantFiltersTypes {
  status?: PlantState;
  minOilStrength?: number;
  maxOilStrength?: number;
  countryOfOrigin?: string;
}
