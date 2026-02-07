import axios, { AxiosInstance } from "axios";
import {
  StorageClientPort,
  SyncCreatedPackagesInput,
  SyncMovedPackagesInput,
} from "../../Application/ports/StorageClientPort";

type SyncResponsePayload = {
  success?: boolean;
  data?: {
    recordedPackages?: number;
    missingPackages?: number;
  };
};

export class AxiosStorageClient implements StorageClientPort {
  private readonly http: AxiosInstance;

  constructor(baseURL: string, gatewayKey: string) {
    this.http = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "X-Gateway-Key": gatewayKey,
      },
      timeout: 5000,
    });
  }

  async syncCreatedPackages(input: SyncCreatedPackagesInput): Promise<void> {
    if (input.packageIds.length === 0) {
      return;
    }

    await this.syncWithStorage({
      packageIds: input.packageIds,
      targetWarehouseId: input.targetWarehouseId,
      operation: "created",
    });
  }

  async syncMovedPackages(input: SyncMovedPackagesInput): Promise<void> {
    if (input.packageIds.length === 0) {
      return;
    }

    await this.syncWithStorage({
      packageIds: input.packageIds,
      targetWarehouseId: input.targetWarehouseId,
      operation: "moved",
    });
  }

  private async syncWithStorage(payload: {
    packageIds: number[];
    targetWarehouseId?: number;
    operation: "created" | "moved";
  }): Promise<void> {
    const response = await this.http.post<SyncResponsePayload>(
      "/storage/internal/packaging-sync",
      payload
    );

    const isSuccess = response.data?.success ?? true;
    if (!isSuccess) {
      throw new Error("Storage microservice nije potvrdio sinhronizaciju paketa.");
    }
  }
}
