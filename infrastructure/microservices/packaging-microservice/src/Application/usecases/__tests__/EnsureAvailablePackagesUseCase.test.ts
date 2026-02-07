import test from "node:test";
import assert from "node:assert/strict";
import { EnsureAvailablePackagesUseCase, PackagePerfumesExecutor } from "../EnsureAvailablePackagesUseCase";
import { PackagingRepositoryPort } from "../../ports/PackagingRepositoryPort";

test("EnsureAvailablePackagesUseCase creates only missing packages", async () => {
  const countCalls: number[] = [];

  const repository: PackagingRepositoryPort = {
    countAvailablePackages: async () => {
      countCalls.push(1);
      return countCalls.length === 1 ? 1 : 4;
    },
    createPackagesFromPerfumes: async () => [],
    sendPackagesToWarehouse: async () => [],
    getWarehouses: async () => [],
    getPackages: async () => [],
  };

  let requestedQuantity = 0;
  const packagePerfumesExecutor: PackagePerfumesExecutor = {
    execute: async (data) => {
      requestedQuantity = data.quantity;
      return {
        requestedQuantity: data.quantity,
        packagedQuantity: data.quantity,
        missingQuantity: 0,
        packageIds: [301, 302, 303],
      };
    },
  };

  const useCase = new EnsureAvailablePackagesUseCase(repository, packagePerfumesExecutor);
  const result = await useCase.execute(4);

  assert.equal(requestedQuantity, 3);
  assert.equal(result.availableBefore, 1);
  assert.equal(result.availableAfter, 4);
  assert.equal(result.createdPackages, 3);
});
