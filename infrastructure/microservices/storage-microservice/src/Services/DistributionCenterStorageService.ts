import { IStorageService } from "../Domain/services/IStorageService";
import { LogLevel } from "../Domain/enums/LogLevel";
import { IStorageRepository } from "../Domain/services/IStorageRepository";
import { ILoggerService } from "../Domain/services/ILoggerService";

export class DistributionCenterStorageService implements IStorageService {
    private static readonly MAX_PER_DISPATCH = 3;
    private static readonly PROCUREMENT_TIME_MS = 500;

    constructor(
        private readonly repository: IStorageRepository,
        private readonly logger: ILoggerService
    ) { }

    async sendPackages(quantity: number): Promise<number> {
        try {
            if (quantity <= 0) {
                await this.logger.log(
                    "Neispravan broj paketa za slanje",
                    LogLevel.ERROR,
                    { additionalData: { quantity } }
                );
                throw new Error("Kolicina mora biti veca od 0");
            }

            const toSend = Math.min(quantity, DistributionCenterStorageService.MAX_PER_DISPATCH);

            await new Promise(resolve => setTimeout(resolve, DistributionCenterStorageService.PROCUREMENT_TIME_MS));

            const sent = await this.repository.sendPackages(toSend);

            await this.logger.log(
                `Poslata ambalaza iz distributivnog centra: ${sent}/${quantity}`,
                LogLevel.INFO,
                { additionalData: { requested: quantity, sent, type: "distribution-center" } }
            );

            return sent;
        } catch (error) {
            await this.logger.log(
                `Greska pri slanju paketa: ${(error as Error).message}`,
                LogLevel.ERROR,
                { additionalData: { requestedQuantity: quantity } }
            );
            throw error;
        }
    }
}