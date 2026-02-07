export interface SendToWarehouseResultDTO {
  requestedPackages: number;
  movedPackages: number;
  missingPackages: number;
  movedPackageIds: number[];
  targetWarehouseId: number;
}
