import { IProductionService } from "../Domain/services/IProductionService";
import { IPlantRepository } from "../Domain/services/IPlantRepository";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { CreatePlantDTO } from "../Domain/DTOs/CreatePlantDTO";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { HarvestPlantsDTO } from "../Domain/DTOs/HarvestPlantsDTO";
import { PlantState } from "../Domain/enums/PlantState";
import { LogLevel } from "../Domain/enums/LogLevel";
import { Plant } from "../Domain/models/Plant";

export class ProductionService implements IProductionService {
  private static readonly MIN_OIL_STRENGTH = 1.0;
  private static readonly MAX_OIL_STRENGTH = 5.0;
  private static readonly OIL_STRENGTH_THRESHOLD = 4.0;

  constructor(
    private readonly plantRepository: IPlantRepository,
    private readonly logger: ILoggerService
  ) {}

  async plantNewPlant(data: CreatePlantDTO): Promise<PlantDTO> {
    try {
      const plant = await this.plantRepository.create(data);

      await this.logger.log(
        `Zasadjena biljka: ${plant.commonName}`,
        LogLevel.INFO,
        { additionalData: { plantId: plant.id, latinName: plant.latinName } }
      );

      return this.toDTO(plant);
    } catch (error) {
      await this.logger.log(
        `Greska pri sadjenju biljke: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { plantData: data } }
      );
      throw error;
    }
  }

  async changeOilStrength(plantId: number, percentageChange: number): Promise<PlantDTO> {
    try {
      const plant = await this.plantRepository.findById(plantId);

      if (!plant) {
        throw new Error(`Biljka sa ID ${plantId} nije pronadjena`);
      }

      const currentStrength = Number(plant.oilStrength);
      let newStrength = currentStrength * (1 + percentageChange / 100);

      newStrength = Math.max(
        ProductionService.MIN_OIL_STRENGTH,
        Math.min(ProductionService.MAX_OIL_STRENGTH, newStrength)
      );

      newStrength = Math.round(newStrength * 10) / 10;

      const updatedPlant = await this.plantRepository.update(plantId, {
        oilStrength: newStrength,
      });

      if (newStrength > ProductionService.OIL_STRENGTH_THRESHOLD) {
        await this.logger.log(
          `Upozorenje: Jacina ulja prelazi ${ProductionService.OIL_STRENGTH_THRESHOLD}`,
          LogLevel.WARNING,
          {
            additionalData: {
              plantId: plant.id,
              oldStrength: currentStrength,
              newStrength: newStrength,
            },
          }
        );
      }

      await this.logger.log(
        `Promenjena jacina aromaticnih ulja za biljku ${plant.commonName}`,
        LogLevel.INFO,
        {
          additionalData: {
            plantId: plant.id,
            oldStrength: currentStrength,
            newStrength: newStrength,
            percentageChange: percentageChange,
          },
        }
      );

      return this.toDTO(updatedPlant);
    } catch (error) {
      await this.logger.log(
        `Greska pri promeni jacine ulja: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { plantId, percentageChange } }
      );
      throw error;
    }
  }

  async harvestPlants(data: HarvestPlantsDTO): Promise<PlantDTO[]> {
    try {
      const availableCount = await this.plantRepository.countByCommonNameAndState(
        data.commonName,
        PlantState.PLANTED
      );

      if (availableCount < data.quantity) {
        throw new Error(
          `Nedovoljno biljaka vrste ${data.commonName}. Dostupno: ${availableCount}, Trazeno: ${data.quantity}`
        );
      }

      const plantedPlants = await this.plantRepository.findByCriteria({
        commonName: data.commonName,
        state: PlantState.PLANTED,
      });

      const plantsToHarvest = plantedPlants.slice(0, data.quantity);
      const harvestedPlants: PlantDTO[] = [];

      for (const plant of plantsToHarvest) {
        const updatedPlant = await this.plantRepository.update(plant.id, {
          state: PlantState.HARVESTED,
        });
        harvestedPlants.push(this.toDTO(updatedPlant));
      }

      await this.logger.log(
        `Ubrano ${data.quantity} biljaka vrste ${data.commonName}`,
        LogLevel.INFO,
        {
          additionalData: {
            commonName: data.commonName,
            quantity: data.quantity,
            plantIds: harvestedPlants.map((p) => p.id),
          },
        }
      );

      return harvestedPlants;
    } catch (error) {
      await this.logger.log(
        `Greska pri branju biljaka: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { harvestData: data } }
      );
      throw error;
    }
  }

  async getAvailablePlants(): Promise<PlantDTO[]> {
    const plants = await this.plantRepository.findByState(PlantState.PLANTED);
    return plants.map((plant) => this.toDTO(plant));
  }

  async getPlantById(id: number): Promise<PlantDTO> {
    const plant = await this.plantRepository.findById(id);

    if (!plant) {
      throw new Error(`Biljka sa ID ${id} nije pronadjena`);
    }

    return this.toDTO(plant);
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