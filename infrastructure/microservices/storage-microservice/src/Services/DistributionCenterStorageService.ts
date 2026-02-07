import { IStorageRepository } from "../Domain/services/IStorageRepository";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { IPackagingClient } from "../Domain/services/IPackagingClient";
import { DispatchProfile, TimedBatchStorageService } from "./TimedBatchStorageService";

const DISTRIBUTION_PROFILE: DispatchProfile = {
    maxPerDispatch: 3,
    procurementTimeMs: 500,
    successMessagePrefix: "Poslata ambalaza iz distributivnog centra",
    invalidQuantityMessage: "Neispravan broj paketa za slanje",
    errorMessagePrefix: "Greska pri slanju paketa",
    type: "distribution-center",
};

export class DistributionCenterStorageService extends TimedBatchStorageService {
    constructor(
        repository: IStorageRepository,
        packagingClient: IPackagingClient,
        logger: ILoggerService
    ) {
        super(repository, packagingClient, logger, DISTRIBUTION_PROFILE);
    }
}
