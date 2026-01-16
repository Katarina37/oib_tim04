export interface PlantData {
  id: number;
  commonName: string;
  oilStrength: number;
  state: string;
}

export interface IProductionClient {
  getPlantedPlants(): Promise<PlantData[]>;
  updatePlantOilStrength(plantId: number, newStrength: number): Promise<void>;
  deletePlant(plantId: number): Promise<void>;
  duplicatePlant(plantId: number): Promise<PlantData>;
}
