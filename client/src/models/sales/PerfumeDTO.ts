export enum PerfumeType {
  PERFUME = "parfem",
  COLOGNE = "kolonjska_voda",
}

export interface PerfumeDTO {
  id: number;
  name: string;
  type: PerfumeType;
  volumeMl: number;
  serialNumber: string;
  plantId: number;
  expiryDate: string;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}
