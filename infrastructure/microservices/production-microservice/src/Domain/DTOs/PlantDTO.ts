import { PlantState } from "../enums/PlantState";

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