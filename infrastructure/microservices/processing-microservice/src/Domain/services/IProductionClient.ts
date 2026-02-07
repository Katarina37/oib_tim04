import { PlantState } from "../enums/PlantState";

export interface ProductionPlantDTO {
  id: number;
  commonName: string;
  oilStrength: number;
  latinName: string;
  countryOfOrigin: string;
  state: PlantState;
  createdAt: string;
  updatedAt: string;
}

export interface IProductionClient {
  getPlantsByState(state: PlantState): Promise<ProductionPlantDTO[]>;
  getPlantedPlantsByCommonName(commonName: string): Promise<ProductionPlantDTO[]>;
  plant(data: {
    commonName: string;
    latinName: string;
    countryOfOrigin: string;
    oilStrength?: number;
  }): Promise<ProductionPlantDTO>;
  changeOilStrength(plantId: number, percentageChange: number): Promise<ProductionPlantDTO>;
  harvestPlants(commonName: string, quantity: number): Promise<ProductionPlantDTO[]>;
  markPlantsProcessed(plantIds: number[]): Promise<void>;
}
