import { PlantState } from "../enums/PlantState";

export interface UpdatePlantDTO {
  commonName?: string;
  oilStrength?: number;
  latinName?: string;
  countryOfOrigin?: string;
  state?: PlantState;
}