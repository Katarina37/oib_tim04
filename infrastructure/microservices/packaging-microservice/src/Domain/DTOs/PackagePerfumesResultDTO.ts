export interface PackagePerfumesResultDTO {
  requestedQuantity: number;
  packagedQuantity: number;
  missingQuantity: number;
  packageIds: number[];
  targetWarehouseId?: number;
}
