import { PlantState } from "../enums/PlantState";

export class Plant {
  id!: number;
  commonName!: string;
  oilStrength!: number;
  latinName!: string;
  countryOfOrigin!: string;
  state!: PlantState;
  createdAt!: Date;
  updatedAt!: Date;
}
