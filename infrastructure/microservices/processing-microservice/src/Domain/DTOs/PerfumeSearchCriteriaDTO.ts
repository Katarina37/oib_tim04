import { BottleVolume } from "../enums/BottleVolume";
import { PerfumeType } from "../enums/PerfumeType";

export type PerfumeSortField = "createdAt" | "name" | "type" | "netVolumeMl" | "expiryDate";
export type SortDirection = "ASC" | "DESC";

export interface PerfumeSearchCriteriaDTO {
  perfumeName?: string;
  perfumeType?: PerfumeType;
  bottleVolumeMl?: BottleVolume;
  onlyAvailableForPackaging?: boolean;
  sortBy?: PerfumeSortField;
  sortDirection?: SortDirection;
}
