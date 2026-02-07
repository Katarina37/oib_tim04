import test from "node:test";
import assert from "node:assert/strict";
import {
  EnsureAvailablePackagesExecutor,
  SendToWarehouseUseCase,
} from "../SendToWarehouseUseCase";
import { PackagingRepositoryPort } from "../../ports/PackagingRepositoryPort";
import { StorageClientPort } from "../../ports/StorageClientPort";
import { ILoggerService } from "../../../Domain/services/ILoggerService";
import { LogLevel } from "../../../Domain/enums/LogLevel";

const createLoggerStub = (): ILoggerService => ({
  log: async (_message: string, _level: LogLevel) => Promise.resolve(),
});

test("SendToWarehouseUseCase auto packages first available package when none exists", async () => {
  let sendCalls = 0;
  let ensuredQuantity = 0;
  let syncedPackageIds: number[] = [];

  const repository: PackagingRepositoryPort = {
    countAvailablePackages: async () => 0,
    createPackagesFromPerfumes: async () => [],
    sendPackagesToWarehouse: async () => {
      sendCalls += 1;
      return sendCalls === 1 ? [] : [501];
    },
    getWarehouses: async () => [],
    getPackages: async () => [],
  };

  const storageClient: StorageClientPort = {
    syncCreatedPackages: async () => Promise.resolve(),
    syncMovedPackages: async (input) => {
      syncedPackageIds = input.packageIds;
    },
  };

  const ensureAvailablePackagesUseCase: EnsureAvailablePackagesExecutor = {
    execute: async (quantity) => {
      ensuredQuantity = quantity;
      return {
        requestedQuantity: quantity,
        availableBefore: 0,
        availableAfter: quantity,
        createdPackages: quantity,
      };
    },
  };

  const useCase = new SendToWarehouseUseCase(
    repository,
    storageClient,
    createLoggerStub(),
    ensureAvailablePackagesUseCase
  );

  const result = await useCase.execute({ targetWarehouseId: 2 });

  assert.equal(ensuredQuantity, 1);
  assert.equal(sendCalls, 2);
  assert.equal(result.movedPackages, 1);
  assert.equal(result.missingPackages, 0);
  assert.deepEqual(result.movedPackageIds, [501]);
  assert.deepEqual(syncedPackageIds, [501]);
});

test("SendToWarehouseUseCase skips auto packaging for manual package IDs", async () => {
  let ensuredInvoked = false;
  let sendCalls = 0;

  const repository: PackagingRepositoryPort = {
    countAvailablePackages: async () => 0,
    createPackagesFromPerfumes: async () => [],
    sendPackagesToWarehouse: async () => {
      sendCalls += 1;
      return [600, 601];
    },
    getWarehouses: async () => [],
    getPackages: async () => [],
  };

  const storageClient: StorageClientPort = {
    syncCreatedPackages: async () => Promise.resolve(),
    syncMovedPackages: async () => Promise.resolve(),
  };

  const ensureAvailablePackagesUseCase: EnsureAvailablePackagesExecutor = {
    execute: async (quantity) => {
      ensuredInvoked = true;
      return {
        requestedQuantity: quantity,
        availableBefore: 0,
        availableAfter: quantity,
        createdPackages: quantity,
      };
    },
  };

  const useCase = new SendToWarehouseUseCase(
    repository,
    storageClient,
    createLoggerStub(),
    ensureAvailablePackagesUseCase
  );

  const result = await useCase.execute({
    targetWarehouseId: 3,
    packageIds: [600, 601],
  });

  assert.equal(ensuredInvoked, false);
  assert.equal(sendCalls, 1);
  assert.equal(result.requestedPackages, 2);
  assert.equal(result.movedPackages, 2);
});
