import { PlantState } from "../enums/PlantState";

export interface PlantSearchCriteriaDTO {
  commonName?: string;
  latinName?: string;
  countryOfOrigin?: string;
  state?: PlantState;
  minOilStrength?: number;
  maxOilStrength?: number;
}