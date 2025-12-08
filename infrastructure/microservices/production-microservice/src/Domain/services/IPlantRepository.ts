import { Plant } from "../models/Plant";
import { CreatePlantDTO } from "../DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../DTOs/UpdatePlantDTO";
import { PlantSearchCriteriaDTO } from "../DTOs/PlantSearchCriteriaDTO";
import { PlantState } from "../enums/PlantState";

export interface IPlantRepository {
  findAll(): Promise<Plant[]>;
  findById(id: number): Promise<Plant | null>;
  findByState(state: PlantState): Promise<Plant[]>;
  findByCommonName(commonName: string): Promise<Plant[]>;
  findByCriteria(criteria: PlantSearchCriteriaDTO): Promise<Plant[]>;
  create(data: CreatePlantDTO): Promise<Plant>;
  update(id: number, data: UpdatePlantDTO): Promise<Plant>;
  delete(id: number): Promise<void>;
  countByCommonNameAndState(commonName: string, state: PlantState): Promise<number>;
}