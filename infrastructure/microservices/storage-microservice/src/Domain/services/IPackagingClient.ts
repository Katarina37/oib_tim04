export interface EnsureAvailablePackagesResultDTO {
  requestedQuantity: number;
  availableBefore: number;
  availableAfter: number;
  createdPackages: number;
}

export interface IPackagingClient {
  ensureAvailablePackages(quantity: number): Promise<EnsureAvailablePackagesResultDTO>;
}
