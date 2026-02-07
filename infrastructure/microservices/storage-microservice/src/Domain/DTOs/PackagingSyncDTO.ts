export type PackagingSyncOperation = "created" | "moved";

export interface PackagingSyncDTO {
  packageIds: number[];
  operation: PackagingSyncOperation;
  targetWarehouseId?: number;
}

export interface PackagingSyncResultDTO {
  operation: PackagingSyncOperation;
  recordedPackages: number;
  missingPackages: number;
}
