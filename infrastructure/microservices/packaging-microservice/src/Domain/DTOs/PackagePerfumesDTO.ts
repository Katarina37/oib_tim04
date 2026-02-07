import { BottleVolume } from "../enums/BottleVolume";
import { PerfumeType } from "../enums/PerfumeType";

export interface PackagePerfumesDTO {
  quantity: number;
  targetWarehouseId?: number;
  perfumeType?: PerfumeType;
  perfumeName?: string;
  bottleVolumeMl?: BottleVolume;
  packageName?: string;
  senderAddress?: string;
}
