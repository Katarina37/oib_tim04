import { BottleVolume } from "../enums/BottleVolume";
import { PerfumeType } from "../enums/PerfumeType";

export interface RequestPerfumesDTO {
  quantity: number;
  perfumeType?: PerfumeType;
  perfumeName?: string;
  bottleVolumeMl?: BottleVolume;
}
