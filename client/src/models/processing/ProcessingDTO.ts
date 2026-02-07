export enum PerfumeType {
  PERFUME = "parfem",
  COLOGNE_WATER = "kolonjska_voda",
}

export enum BottleVolume {
  ML_150 = 150,
  ML_250 = 250,
}

export interface PerfumeDTO {
  id: number;
  name: string;
  type: PerfumeType;
  netVolumeMl: number;
  serialNumber: string;
  plantId: number;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  isPackaged: boolean;
}

export interface StartProcessingDTO {
  perfumeName: string;
  perfumeType: PerfumeType;
  bottleQuantity: number;
  bottleVolumeMl: BottleVolume;
}

export interface RequestPerfumesDTO {
  quantity: number;
  perfumeType?: PerfumeType;
  perfumeName?: string;
  bottleVolumeMl?: BottleVolume;
}

export interface PerfumeBatchDTO {
  requestedQuantity: number;
  returnedQuantity: number;
  perfumes: PerfumeDTO[];
}

export interface ProcessingSummaryDTO {
  requiredPlants: number;
  requestedBottleQuantity: number;
  bottleVolumeMl: number;
  usedPlantIds: number[];
  createdPerfumes: PerfumeDTO[];
}

export interface ProcessingStatsDTO {
  totalPerfumes: number;
  availableForPackaging: number;
  perfumeCount: number;
  cologneCount: number;
}

export interface PerfumeSearchCriteriaDTO {
  perfumeName?: string;
  perfumeType?: PerfumeType;
  bottleVolumeMl?: BottleVolume;
  onlyAvailableForPackaging?: boolean;
  sortBy?: "createdAt" | "name" | "type" | "netVolumeMl" | "expiryDate";
  sortDirection?: "ASC" | "DESC";
}
