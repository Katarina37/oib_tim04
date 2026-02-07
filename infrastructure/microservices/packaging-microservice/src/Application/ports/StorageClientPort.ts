export interface SyncCreatedPackagesInput {
  packageIds: number[];
  targetWarehouseId?: number;
}

export interface SyncMovedPackagesInput {
  packageIds: number[];
  targetWarehouseId: number;
}

export interface StorageClientPort {
  syncCreatedPackages(input: SyncCreatedPackagesInput): Promise<void>;
  syncMovedPackages(input: SyncMovedPackagesInput): Promise<void>;
}
