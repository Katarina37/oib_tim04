import test from "node:test";
import assert from "node:assert/strict";
import { PackagePerfumesUseCase } from "../PackagePerfumesUseCase";
import { PackagingRepositoryPort } from "../../ports/PackagingRepositoryPort";
import { ProcessingClientPort } from "../../ports/ProcessingClientPort";
import { StorageClientPort } from "../../ports/StorageClientPort";
import { ILoggerService } from "../../../Domain/services/ILoggerService";
import { LogLevel } from "../../../Domain/enums/LogLevel";

const createLoggerStub = (): ILoggerService => ({
  log: async (_message: string, _level: LogLevel) => Promise.resolve(),
});

test("PackagePerfumesUseCase packages perfumes and syncs created package IDs to storage", async () => {
  let syncedPackageIds: number[] = [];

  const repository: PackagingRepositoryPort = {
    countAvailablePackages: async () => 0,
    createPackagesFromPerfumes: async (perfumeIds) => perfumeIds.map((id) => id + 100),
    sendPackagesToWarehouse: async () => [],
    getWarehouses: async () => [],
    getPackages: async () => [],
  };

  const processingClient: ProcessingClientPort = {
    requestPerfumesForPackaging: async () => [
      {
        id: 1,
        name: "P1",
        type: "parfem",
        netVolumeMl: 150,
        serialNumber: "SN-1",
        plantId: 11,
        expiryDate: "2030-01-01",
      },
      {
        id: 2,
        name: "P2",
        type: "parfem",
        netVolumeMl: 150,
        serialNumber: "SN-2",
        plantId: 12,
        expiryDate: "2030-01-01",
      },
    ],
  };

  const storageClient: StorageClientPort = {
    syncCreatedPackages: async (input) => {
      syncedPackageIds = input.packageIds;
    },
    syncMovedPackages: async () => Promise.resolve(),
  };

  const useCase = new PackagePerfumesUseCase(
    repository,
    processingClient,
    storageClient,
    createLoggerStub()
  );

  const result = await useCase.execute({
    quantity: 2,
    perfumeName: "Rose",
  });

  assert.equal(result.requestedQuantity, 2);
  assert.equal(result.packagedQuantity, 2);
  assert.deepEqual(result.packageIds, [101, 102]);
  assert.deepEqual(syncedPackageIds, [101, 102]);
});
