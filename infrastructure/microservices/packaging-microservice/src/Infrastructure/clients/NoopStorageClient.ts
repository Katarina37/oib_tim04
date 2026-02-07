import {
  StorageClientPort,
  SyncCreatedPackagesInput,
  SyncMovedPackagesInput,
} from "../../Application/ports/StorageClientPort";

export class NoopStorageClient implements StorageClientPort {
  async syncCreatedPackages(_input: SyncCreatedPackagesInput): Promise<void> {
    return Promise.resolve();
  }

  async syncMovedPackages(_input: SyncMovedPackagesInput): Promise<void> {
    return Promise.resolve();
  }
}
