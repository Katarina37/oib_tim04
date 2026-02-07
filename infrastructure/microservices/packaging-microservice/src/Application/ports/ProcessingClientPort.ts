import { BottleVolume } from "../../Domain/enums/BottleVolume";
import { PerfumeType } from "../../Domain/enums/PerfumeType";

export interface ProcessingPerfumeDTO {
  id: number;
  name: string;
  type: string;
  netVolumeMl: number;
  serialNumber: string;
  plantId: number;
  expiryDate: string;
}

export interface RequestPerfumesCriteria {
  quantity: number;
  perfumeType?: PerfumeType;
  perfumeName?: string;
  bottleVolumeMl?: BottleVolume;
}

export interface ProcessingClientPort {
  requestPerfumesForPackaging(
    criteria: number | RequestPerfumesCriteria
  ): Promise<ProcessingPerfumeDTO[]>;
}
