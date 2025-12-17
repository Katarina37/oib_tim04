import {
  ChangeOilStrengthDTO,
  HarvestPlantsDTO,
  PlantDTO,
  PlantSearchCriteriaDTO,
} from "../../models/plants/PlantDTO";

export interface IPlantAPI {
  getAllPlants(token: string, criteria?: PlantSearchCriteriaDTO): Promise<PlantDTO[]>;
  searchPlants(criteria: PlantSearchCriteriaDTO, token: string): Promise<PlantDTO[]>;
  getPlantById(id: number, token: string): Promise<PlantDTO>;
  createPlant(plant: PlantDTO, token: string): Promise<PlantDTO>;
  updatePlant(id: number, plant: PlantDTO, token: string): Promise<PlantDTO>;
  deletePlant(id: number, token: string): Promise<void>;
  harvestPlants(data: HarvestPlantsDTO, token: string): Promise<PlantDTO[]>;
  changeOilStrength(data: ChangeOilStrengthDTO, token: string): Promise<PlantDTO>;
}
