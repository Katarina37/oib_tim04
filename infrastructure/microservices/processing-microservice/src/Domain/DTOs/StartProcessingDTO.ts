import { BottleVolume } from "../enums/BottleVolume";
import { PerfumeType } from "../enums/PerfumeType";

export interface StartProcessingDTO {
  perfumeName: string;
  perfumeType: PerfumeType;
  bottleQuantity: number;
  bottleVolumeMl: BottleVolume;
}
