import { PerfumeBatchDTO } from "../Domain/DTOs/PerfumeBatchDTO";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { PerfumeSearchCriteriaDTO } from "../Domain/DTOs/PerfumeSearchCriteriaDTO";
import { ProcessingSummaryDTO } from "../Domain/DTOs/ProcessingSummaryDTO";
import { RequestPerfumesDTO } from "../Domain/DTOs/RequestPerfumesDTO";
import { StartProcessingDTO } from "../Domain/DTOs/StartProcessingDTO";
import { LogLevel } from "../Domain/enums/LogLevel";
import { PlantState } from "../Domain/enums/PlantState";
import { IProcessingRepository } from "../Domain/services/IProcessingRepository";
import { IProcessingService } from "../Domain/services/IProcessingService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { INotificationClient } from "../Domain/services/INotificationClient";
import {
  IProductionClient,
  ProductionPlantDTO,
} from "../Domain/services/IProductionClient";

type PlantProfile = {
  commonName: string;
  latinName: string;
  countryOfOrigin: string;
};

export class ProcessingService implements IProcessingService {
  private static readonly ML_PER_PLANT = 50;
  private static readonly OIL_STRENGTH_THRESHOLD = 4.0;
  private static readonly MIN_PERCENTAGE_CORRECTION = 0.1;
  private static readonly DEFAULT_PLANT_PROFILE: PlantProfile = {
    commonName: "Lavanda",
    latinName: "Lavandula angustifolia",
    countryOfOrigin: "Francuska",
  };

  constructor(
    private readonly processingRepository: IProcessingRepository,
    private readonly logger: ILoggerService,
    private readonly productionClient: IProductionClient,
    private readonly notificationClient: INotificationClient
  ) {}

  async startProcessing(data: StartProcessingDTO): Promise<ProcessingSummaryDTO> {
    const requiredPlants = this.calculateRequiredPlants(
      data.bottleQuantity,
      data.bottleVolumeMl
    );
    const plantsPerBottle = this.calculatePlantsPerBottle(data.bottleVolumeMl);

    try {
      await this.ensureRequiredHarvestedPlants(requiredPlants);
      const harvestedPlants = await this.productionClient.getPlantsByState(PlantState.HARVESTED);
      const plantsForProcessing = harvestedPlants.slice(0, requiredPlants);
      const harvestedPlantIds = plantsForProcessing.map((plant) => plant.id);

      if (harvestedPlantIds.length < requiredPlants) {
        throw new Error(
          `Nedovoljno ubranih biljaka nakon orkestracije sa proizvodnjom. Dostupno: ${harvestedPlantIds.length}, potrebno: ${requiredPlants}.`
        );
      }

      const result = await this.processingRepository.startProcessing({
        perfumeData: data,
        requiredPlantCount: requiredPlants,
        harvestedPlantIds,
        plantsPerBottle,
      });

      await this.safeMarkPlantsAsProcessed(result.usedPlantIds);
      await this.safeBalanceHighOilPlants(plantsForProcessing);

      await this.logger.log(
        `Uspesno pokrenuta prerada: ${data.bottleQuantity} bocica (${data.bottleVolumeMl}ml) za ${data.perfumeName}`,
        LogLevel.INFO,
        {
          additionalData: {
            perfumeName: data.perfumeName,
            perfumeType: data.perfumeType,
            bottleQuantity: data.bottleQuantity,
            bottleVolumeMl: data.bottleVolumeMl,
            requiredPlants,
            usedPlantIds: result.usedPlantIds,
            createdPerfumeIds: result.createdPerfumes.map((perfume) => perfume.id),
          },
        }
      );

      return {
        requiredPlants,
        requestedBottleQuantity: data.bottleQuantity,
        bottleVolumeMl: data.bottleVolumeMl,
        usedPlantIds: result.usedPlantIds,
        createdPerfumes: result.createdPerfumes.map((perfume) => ({
          id: perfume.id,
          name: perfume.name,
          type: perfume.type,
          netVolumeMl: perfume.netVolumeMl,
          serialNumber: perfume.serialNumber,
          plantId: perfume.plantId,
          expiryDate: perfume.expiryDate,
          createdAt: perfume.createdAt,
          updatedAt: perfume.updatedAt,
          isPackaged: false,
        })),
      };
    } catch (error) {
      await this.logger.log(
        `Neuspesna prerada: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          additionalData: {
            perfumeName: data.perfumeName,
            perfumeType: data.perfumeType,
            bottleQuantity: data.bottleQuantity,
            bottleVolumeMl: data.bottleVolumeMl,
            requiredPlants,
          },
        }
      );
      await this.trySendNotificationEvent({
        eventType: "PROCESSING_FAILED",
        sourceService: "processing-microservice",
        title: "Neuspesna prerada",
        message: `Prerada nije uspela: ${(error as Error).message}`,
        priority: "ERROR",
        targetRole: "SALES_MANAGER",
        metadata: {
          perfumeName: data.perfumeName,
          bottleQuantity: data.bottleQuantity,
          bottleVolumeMl: data.bottleVolumeMl,
          requiredPlants,
        },
      });
      throw error;
    }
  }

  async requestPerfumes(data: RequestPerfumesDTO): Promise<PerfumeBatchDTO> {
    try {
      const result = await this.processingRepository.requestPerfumesForPackaging({
        quantity: data.quantity,
        perfumeName: data.perfumeName,
        perfumeType: data.perfumeType,
        bottleVolumeMl: data.bottleVolumeMl,
      });

      await this.logger.log(
        `Preuzeto ${result.returnedQuantity}/${result.requestedQuantity} parfema za pakovanje`,
        LogLevel.INFO,
        {
          additionalData: {
            requestedQuantity: result.requestedQuantity,
            returnedQuantity: result.returnedQuantity,
            perfumeType: data.perfumeType,
            perfumeName: data.perfumeName,
            bottleVolumeMl: data.bottleVolumeMl,
            perfumeIds: result.perfumes.map((perfume) => perfume.id),
          },
        }
      );

      return result;
    } catch (error) {
      await this.logger.log(
        `Neuspesno preuzimanje parfema za pakovanje: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          additionalData: {
            requestedQuantity: data.quantity,
            perfumeType: data.perfumeType,
            perfumeName: data.perfumeName,
            bottleVolumeMl: data.bottleVolumeMl,
          },
        }
      );
      throw error;
    }
  }

  async getPerfumes(criteria?: PerfumeSearchCriteriaDTO): Promise<PerfumeDTO[]> {
    return this.processingRepository.findPerfumes(criteria);
  }

  async getStats(): Promise<{
    totalPerfumes: number;
    availableForPackaging: number;
    perfumeCount: number;
    cologneCount: number;
  }> {
    return this.processingRepository.getProcessingStats();
  }

  private calculateRequiredPlants(bottleQuantity: number, bottleVolumeMl: number): number {
    const totalMl = bottleQuantity * bottleVolumeMl;
    return Math.ceil(totalMl / ProcessingService.ML_PER_PLANT);
  }

  private calculatePlantsPerBottle(bottleVolumeMl: number): number {
    return Math.ceil(bottleVolumeMl / ProcessingService.ML_PER_PLANT);
  }

  private async ensureRequiredHarvestedPlants(
    requiredPlants: number
  ): Promise<void> {
    const harvestedPlants = await this.productionClient.getPlantsByState(PlantState.HARVESTED);
    const missingPlants = requiredPlants - harvestedPlants.length;

    if (missingPlants <= 0) {
      return;
    }

    const profile = await this.resolvePlantProfile();

    await this.logger.log(
      `Nedovoljno ubranih biljaka (${harvestedPlants.length}/${requiredPlants}). Pokretanje auto-sadnje i berbe.`,
      LogLevel.WARNING,
      {
        additionalData: {
          requiredPlants,
          harvestedPlants: harvestedPlants.length,
          missingPlants,
          commonName: profile.commonName,
        },
      }
    );

    await this.trySendNotificationEvent({
      eventType: "PROCESSING_INSUFFICIENT_PLANTS",
      sourceService: "processing-microservice",
      title: "Nema dovoljno biljaka za preradu",
      message: `Dostupno ${harvestedPlants.length}, potrebno ${requiredPlants}. Pokrenuta je auto-sadnja i berba.`,
      priority: "WARNING",
      targetRole: "SALES_MANAGER",
      metadata: {
        requiredPlants,
        harvestedPlants: harvestedPlants.length,
        missingPlants,
      },
    });

    await this.ensurePlantedInventory(profile, missingPlants);
    await this.productionClient.harvestPlants(profile.commonName, missingPlants);
  }

  private async resolvePlantProfile(): Promise<PlantProfile> {
    const plantedPlants = await this.productionClient.getPlantsByState(PlantState.PLANTED);
    const seedPlant = plantedPlants[0];

    if (!seedPlant) {
      return ProcessingService.DEFAULT_PLANT_PROFILE;
    }

    return {
      commonName: seedPlant.commonName,
      latinName: seedPlant.latinName,
      countryOfOrigin: seedPlant.countryOfOrigin,
    };
  }

  private async ensurePlantedInventory(
    profile: PlantProfile,
    requiredQuantity: number
  ): Promise<void> {
    const plantedPlants = await this.productionClient.getPlantedPlantsByCommonName(profile.commonName);
    const missingPlants = requiredQuantity - plantedPlants.length;

    if (missingPlants <= 0) {
      return;
    }

    for (let index = 0; index < missingPlants; index += 1) {
      await this.productionClient.plant({
        commonName: profile.commonName,
        latinName: profile.latinName,
        countryOfOrigin: profile.countryOfOrigin,
      });
    }
  }

  private async safeBalanceHighOilPlants(plantsForProcessing: ProductionPlantDTO[]): Promise<void> {
    const overThresholdPlants = plantsForProcessing.filter(
      (plant) => Number(plant.oilStrength) > ProcessingService.OIL_STRENGTH_THRESHOLD
    );

    if (overThresholdPlants.length === 0) {
      return;
    }

    for (const processedPlant of overThresholdPlants) {
      try {
        const replacementPlant = await this.productionClient.plant({
          commonName: processedPlant.commonName,
          latinName: processedPlant.latinName,
          countryOfOrigin: processedPlant.countryOfOrigin,
        });

        const percentageChange = this.calculateOilStrengthCorrectionFromThreshold(
          processedPlant.oilStrength
        );

        if (Math.abs(percentageChange) >= ProcessingService.MIN_PERCENTAGE_CORRECTION) {
          await this.productionClient.changeOilStrength(replacementPlant.id, percentageChange);
        }

        await this.logger.log(
          `Izvrsena korekcija ravnoteze aroma nakon prerade biljke ${processedPlant.id}`,
          LogLevel.INFO,
          {
            additionalData: {
              processedPlantId: processedPlant.id,
              processedPlantOilStrength: processedPlant.oilStrength,
              plantedReplacementId: replacementPlant.id,
              percentageChange,
            },
          }
        );
      } catch (error) {
        await this.logger.log(
          `Neuspesna korekcija ravnoteze aroma nakon prerade biljke ${processedPlant.id}: ${(error as Error).message}`,
          LogLevel.WARNING,
          {
            additionalData: {
              processedPlantId: processedPlant.id,
              processedPlantOilStrength: processedPlant.oilStrength,
            },
          }
        );
      }
    }
  }

  private calculateOilStrengthCorrectionFromThreshold(processedOilStrength: number): number {
    const processed = Number(processedOilStrength);
    if (!Number.isFinite(processed)) {
      return 0;
    }

    const overflow = processed - ProcessingService.OIL_STRENGTH_THRESHOLD;
    if (overflow <= 0) {
      return 0;
    }

    const keepPercentage = Math.max(0, Math.min(100, overflow * 100));
    return Math.round((keepPercentage - 100) * 10) / 10;
  }

  private async safeMarkPlantsAsProcessed(plantIds: number[]): Promise<void> {
    try {
      await this.productionClient.markPlantsProcessed(plantIds);
    } catch (error) {
      await this.logger.log(
        `Parfemi su kreirani, ali nije uspela sinhronizacija stanja biljaka ka proizvodnji: ${(error as Error).message}`,
        LogLevel.WARNING,
        {
          additionalData: {
            plantIds,
          },
        }
      );
    }
  }

  private async trySendNotificationEvent(payload: {
    eventType: string;
    sourceService: string;
    title: string;
    message: string;
    priority: "INFO" | "WARNING" | "ERROR";
    targetRole?: "ADMIN" | "SALES_MANAGER" | "SELLER";
    targetUserId?: number;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.notificationClient.sendEvent(payload);
    } catch (notificationError) {
      console.error(
        "Notification event delivery failed:",
        (notificationError as Error).message,
        payload
      );
    }
  }
}
