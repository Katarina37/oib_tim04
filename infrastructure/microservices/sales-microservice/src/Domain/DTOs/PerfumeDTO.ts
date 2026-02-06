import { PerfumeType } from "../enums/PerfumeType";

export interface PerfumeDTO {
  id: number;
  name: string;
  type: PerfumeType;
  volumeMl: 150 | 250;
  serialNumber: string;
  plantId: number;
  expiryDate: string;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}
