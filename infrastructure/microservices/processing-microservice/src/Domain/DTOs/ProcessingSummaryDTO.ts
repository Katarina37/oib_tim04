import { PerfumeDTO } from "./PerfumeDTO";

export interface ProcessingSummaryDTO {
  requiredPlants: number;
  requestedBottleQuantity: number;
  bottleVolumeMl: number;
  usedPlantIds: number[];
  createdPerfumes: PerfumeDTO[];
}
