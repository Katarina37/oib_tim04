import { IStorageService } from "../Domain/services/IStorageService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { LogLevel } from "../Domain/enums/LogLevel";
import { IStorageRepository } from "../Domain/services/IStorageRepository";
export class WarehouseStorageService implements IStorageService {
    private static readonly MAX_PER_DISPATCH = 1;
    private static readonly PROCUREMENT_TIME_MS = 2500;

    constructor(
        private readonly repository: IStorageRepository,
        private readonly logger: ILoggerService
    ) { }

    async sendPackages(quantity: number): Promise<number> {
        try {
            if (quantity <= 0) {
                await this.logger.log(
                    "Neispravan broj paketa za slanje iz magacina",
                    LogLevel.ERROR,
                    { additionalData: { quantity } }
                );
                throw new Error("Kolicina mora biti veca od 0");
            }

            const toSend = Math.min(quantity, WarehouseStorageService.MAX_PER_DISPATCH);

            await new Promise(resolve => setTimeout(resolve, WarehouseStorageService.PROCUREMENT_TIME_MS));

            const sent = await this.repository.sendPackages(toSend);

            await this.logger.log(
                `Poslata ambalaza iz magacinskog centra: ${sent}/${quantity}`,
                LogLevel.INFO,
                { additionalData: { requested: quantity, sent, type: "warehouse" } }
            );

            return sent;
        } catch (error) {
            await this.logger.log(
                `Greska pri slanju paketa iz magacina: ${(error as Error).message}`,
                LogLevel.ERROR,
                { additionalData: { requestedQuantity: quantity } }
            );
            throw error;
        }
    }
}
