import { PerfumeType } from "../enums/PerfumeType";

export interface PerfumeDTO {
  id: number;
  name: string;
  type: PerfumeType;
  netVolumeMl: number;
  serialNumber: string;
  plantId: number;
  expiryDate: string;
  createdAt: Date;
  updatedAt: Date;
  isPackaged: boolean;
}
