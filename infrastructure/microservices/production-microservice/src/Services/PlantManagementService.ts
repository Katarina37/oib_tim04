import { IPlantRepository } from "../Domain/services/IPlantRepository";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { CreatePlantDTO } from "../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../Domain/DTOs/UpdatePlantDTO";
import { PlantSearchCriteriaDTO } from "../Domain/DTOs/PlantSearchCriteriaDTO";
import { PlantState } from "../Domain/enums/PlantState";
import { LogLevel } from "../Domain/enums/LogLevel";
import { Plant } from "../Domain/models/Plant";

export interface IPlantManagementService {
  getAllPlants(): Promise<PlantDTO[]>;
  getPlantById(id: number): Promise<PlantDTO>;
  getPlantsByState(state: PlantState): Promise<PlantDTO[]>;
  searchPlants(criteria: PlantSearchCriteriaDTO): Promise<PlantDTO[]>;
  createPlant(data: CreatePlantDTO): Promise<PlantDTO>;
  updatePlant(id: number, data: UpdatePlantDTO): Promise<PlantDTO>;
  deletePlant(id: number): Promise<void>;
}

export class PlantManagementService implements IPlantManagementService {
  constructor(
    private readonly plantRepository: IPlantRepository,
    private readonly logger: ILoggerService
  ) {}

  async getAllPlants(): Promise<PlantDTO[]> {
    const plants = await this.plantRepository.findAll();
    return plants.map((plant) => this.toDTO(plant));
  }

  async getPlantById(id: number): Promise<PlantDTO> {
    const plant = await this.plantRepository.findById(id);

    if (!plant) {
      throw new Error(`Biljka sa ID ${id} nije pronadjena`);
    }

    return this.toDTO(plant);
  }

  async getPlantsByState(state: PlantState): Promise<PlantDTO[]> {
    const plants = await this.plantRepository.findByState(state);
    return plants.map((plant) => this.toDTO(plant));
  }

  async searchPlants(criteria: PlantSearchCriteriaDTO): Promise<PlantDTO[]> {
    const plants = await this.plantRepository.findByCriteria(criteria);
    return plants.map((plant) => this.toDTO(plant));
  }

  async createPlant(data: CreatePlantDTO): Promise<PlantDTO> {
    try {
      const plant = await this.plantRepository.create(data);

      await this.logger.log(
        `Kreirana biljka: ${plant.commonName}`,
        LogLevel.INFO,
        { additionalData: { plantId: plant.id } }
      );

      return this.toDTO(plant);
    } catch (error) {
      await this.logger.log(
        `Greska pri kreiranju biljke: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { plantData: data } }
      );
      throw error;
    }
  }

  async updatePlant(id: number, data: UpdatePlantDTO): Promise<PlantDTO> {
    try {
      const plant = await this.plantRepository.update(id, data);

      await this.logger.log(
        `Azurirana biljka sa ID ${id}`,
        LogLevel.INFO,
        { additionalData: { plantId: id, updateData: data } }
      );

      return this.toDTO(plant);
    } catch (error) {
      await this.logger.log(
        `Greska pri azuriranju biljke: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { plantId: id, updateData: data } }
      );
      throw error;
    }
  }

  async deletePlant(id: number): Promise<void> {
    try {
      await this.plantRepository.delete(id);

      await this.logger.log(
        `Obrisana biljka sa ID ${id}`,
        LogLevel.INFO,
        { additionalData: { plantId: id } }
      );
    } catch (error) {
      await this.logger.log(
        `Greska pri brisanju biljke: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { plantId: id } }
      );
      throw error;
    }
  }

  private toDTO(plant: Plant): PlantDTO {
    return {
      id: plant.id,
      commonName: plant.commonName,
      oilStrength: Number(plant.oilStrength),
      latinName: plant.latinName,
      countryOfOrigin: plant.countryOfOrigin,
      state: plant.state,
      createdAt: plant.createdAt,
      updatedAt: plant.updatedAt,
    };
  }
}