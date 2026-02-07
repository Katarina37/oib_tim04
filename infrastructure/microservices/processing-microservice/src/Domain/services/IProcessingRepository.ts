import { PerfumeBatchDTO } from "../DTOs/PerfumeBatchDTO";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { PerfumeSearchCriteriaDTO } from "../DTOs/PerfumeSearchCriteriaDTO";
import { StartProcessingDTO } from "../DTOs/StartProcessingDTO";
import { BottleVolume } from "../enums/BottleVolume";
import { PerfumeType } from "../enums/PerfumeType";
import { Perfume } from "../models/Perfume";

export interface ProcessingContext {
  perfumeData: StartProcessingDTO;
  requiredPlantCount: number;
  harvestedPlantIds: number[];
  plantsPerBottle: number;
}

export interface ProcessingResult {
  createdPerfumes: Perfume[];
  usedPlantIds: number[];
}

export interface IProcessingRepository {
  startProcessing(context: ProcessingContext): Promise<ProcessingResult>;
  findPerfumes(criteria?: PerfumeSearchCriteriaDTO): Promise<PerfumeDTO[]>;
  requestPerfumesForPackaging(criteria: {
    quantity: number;
    perfumeType?: PerfumeType;
    perfumeName?: string;
    bottleVolumeMl?: BottleVolume;
  }): Promise<PerfumeBatchDTO>;
  getProcessingStats(): Promise<{
    totalPerfumes: number;
    availableForPackaging: number;
    perfumeCount: number;
    cologneCount: number;
  }>;
}
