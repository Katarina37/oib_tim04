import { PerfumeType } from "../enums/PerfumeType";

export class Perfume {
  id!: number;
  name!: string;
  type!: PerfumeType;
  netVolumeMl!: number;
  serialNumber!: string;
  plantId!: number;
  expiryDate!: string;
  isPackaged!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
