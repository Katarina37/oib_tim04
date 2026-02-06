import { ILoggerService } from "../Domain/services/ILoggerService";
import { IStorageRepository } from "../Domain/services/IStorageRepository";
import { DispatchProfile, TimedBatchStorageService } from "./TimedBatchStorageService";

const WAREHOUSE_PROFILE: DispatchProfile = {
    maxPerDispatch: 1,
    procurementTimeMs: 2500,
    successMessagePrefix: "Poslata ambalaza iz magacinskog centra",
    invalidQuantityMessage: "Neispravan broj paketa za slanje iz magacina",
    errorMessagePrefix: "Greska pri slanju paketa iz magacina",
    type: "warehouse",
};

export class WarehouseStorageService extends TimedBatchStorageService {
    constructor(
        repository: IStorageRepository,
        logger: ILoggerService
    ) {
        super(repository, logger, WAREHOUSE_PROFILE);
    }
}
