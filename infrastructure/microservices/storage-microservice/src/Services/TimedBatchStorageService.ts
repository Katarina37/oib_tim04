import { IStorageService } from "../Domain/services/IStorageService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { LogLevel } from "../Domain/enums/LogLevel";
import { IStorageRepository } from "../Domain/services/IStorageRepository";

export interface DispatchProfile {
    maxPerDispatch: number;
    procurementTimeMs: number;
    successMessagePrefix: string;
    invalidQuantityMessage: string;
    errorMessagePrefix: string;
    type: string;
}

export class TimedBatchStorageService implements IStorageService {
    constructor(
        private readonly repository: IStorageRepository,
        private readonly logger: ILoggerService,
        private readonly profile: DispatchProfile
    ) {}

    async sendPackages(quantity: number): Promise<number> {
        try {
            await this.ensureValidQuantity(quantity);

            const { totalSent, dispatches } = await this.dispatchInBatches(quantity);

            const level =
                totalSent === quantity ? LogLevel.INFO : LogLevel.WARNING;

            await this.logger.log(
                `${this.profile.successMessagePrefix}: ${totalSent}/${quantity}`,
                level,
                {
                    additionalData: {
                        requested: quantity,
                        sent: totalSent,
                        dispatches,
                        type: this.profile.type,
                        maxPerDispatch: this.profile.maxPerDispatch,
                        procurementTimeMs: this.profile.procurementTimeMs,
                    },
                }
            );

            return totalSent;
        } catch (error) {
            await this.logger.log(
                `${this.profile.errorMessagePrefix}: ${(error as Error).message}`,
                LogLevel.ERROR,
                { additionalData: { requestedQuantity: quantity, type: this.profile.type } }
            );
            throw error;
        }
    }

    private async ensureValidQuantity(quantity: number): Promise<void> {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            await this.logger.log(
                this.profile.invalidQuantityMessage,
                LogLevel.ERROR,
                { additionalData: { quantity, type: this.profile.type } }
            );
            throw new Error("Kolicina mora biti veca od 0");
        }
    }

    private async dispatchInBatches(quantity: number): Promise<{ totalSent: number; dispatches: number }> {
        let remaining = quantity;
        let totalSent = 0;
        let dispatches = 0;

        while (remaining > 0) {
            const batchSize = Math.min(remaining, this.profile.maxPerDispatch);

            await this.delay(this.profile.procurementTimeMs);

            const sent = await this.repository.sendPackages(batchSize);
            dispatches += 1;
            totalSent += sent;
            remaining -= sent;

            if (sent < batchSize) {
                break;
            }
        }

        return { totalSent, dispatches };
    }

    private async delay(ms: number): Promise<void> {
        await new Promise<void>((resolve) => setTimeout(resolve, ms));
    }
}
