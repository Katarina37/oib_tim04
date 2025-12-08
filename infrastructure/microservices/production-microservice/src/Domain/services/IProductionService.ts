import { CreatePlantDTO } from "../DTOs/CreatePlantDTO";
import { PlantDTO } from "../DTOs/PlantDTO";
import { HarvestPlantsDTO } from "../DTOs/HarvestPlantsDTO";

export interface IProductionService {
  plantNewPlant(data: CreatePlantDTO): Promise<PlantDTO>;
  changeOilStrength(plantId: number, percentageChange: number): Promise<PlantDTO>;
  harvestPlants(data: HarvestPlantsDTO): Promise<PlantDTO[]>;
  getAvailablePlants(): Promise<PlantDTO[]>;
  getPlantById(id: number): Promise<PlantDTO>;
}