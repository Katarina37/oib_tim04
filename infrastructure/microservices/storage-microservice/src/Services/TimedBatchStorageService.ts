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
            const reservedPackageIds = await this.reservePackages(quantity);
            const totalSent = await this.sendReservedPackages(reservedPackageIds);
            const dispatches = Math.ceil(quantity / this.profile.maxPerDispatch);

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

    async reservePackages(quantity: number): Promise<number[]> {
        try {
            await this.ensureValidQuantity(quantity);

            let remaining = quantity;
            const reservedPackageIds: number[] = [];
            let dispatches = 0;

            while (remaining > 0) {
                const batchSize = Math.min(remaining, this.profile.maxPerDispatch);

                await this.delay(this.profile.procurementTimeMs);

                const batchPackageIds = await this.repository.reservePackages(batchSize);
                dispatches += 1;
                reservedPackageIds.push(...batchPackageIds);
                remaining -= batchPackageIds.length;

                if (batchPackageIds.length < batchSize) {
                    break;
                }
            }

            const level =
                reservedPackageIds.length === quantity
                    ? LogLevel.INFO
                    : LogLevel.WARNING;

            await this.logger.log(
                `Rezervisane ambalaze: ${reservedPackageIds.length}/${quantity}`,
                level,
                {
                    additionalData: {
                        requested: quantity,
                        reserved: reservedPackageIds.length,
                        dispatches,
                        type: this.profile.type,
                    },
                }
            );

            return reservedPackageIds;
        } catch (error) {
            await this.logger.log(
                `Greska pri rezervaciji ambalaze: ${(error as Error).message}`,
                LogLevel.ERROR,
                { additionalData: { requestedQuantity: quantity, type: this.profile.type } }
            );
            throw error;
        }
    }

    async sendReservedPackages(packageIds: number[]): Promise<number> {
        try {
            this.ensureValidPackageIds(packageIds);

            const sentPackages = await this.repository.markPackagesAsSent(packageIds);
            const level =
                sentPackages === packageIds.length ? LogLevel.INFO : LogLevel.WARNING;

            await this.logger.log(
                `Poslate rezervisane ambalaze: ${sentPackages}/${packageIds.length}`,
                level,
                {
                    additionalData: {
                        requested: packageIds.length,
                        sent: sentPackages,
                        type: this.profile.type,
                    },
                }
            );

            return sentPackages;
        } catch (error) {
            await this.logger.log(
                `Greska pri slanju rezervisanih ambalaza: ${(error as Error).message}`,
                LogLevel.ERROR,
                { additionalData: { packageCount: packageIds.length, type: this.profile.type } }
            );
            throw error;
        }
    }

    async unpackPackages(packageIds: number[]): Promise<number> {
        try {
            this.ensureValidPackageIds(packageIds);

            const unpackedPackages = await this.repository.unpackPackages(packageIds);
            const level =
                unpackedPackages === packageIds.length
                    ? LogLevel.INFO
                    : LogLevel.WARNING;

            await this.logger.log(
                `Raspakovane ambalaze: ${unpackedPackages}/${packageIds.length}`,
                level,
                {
                    additionalData: {
                        requested: packageIds.length,
                        unpacked: unpackedPackages,
                        type: this.profile.type,
                    },
                }
            );

            return unpackedPackages;
        } catch (error) {
            await this.logger.log(
                `Greska pri raspakivanju ambalaza: ${(error as Error).message}`,
                LogLevel.ERROR,
                { additionalData: { packageCount: packageIds.length, type: this.profile.type } }
            );
            throw error;
        }
    }

    async releasePackages(packageIds: number[]): Promise<number> {
        try {
            this.ensureValidPackageIds(packageIds);

            const releasedPackages = await this.repository.releasePackages(packageIds);
            const level =
                releasedPackages === packageIds.length
                    ? LogLevel.INFO
                    : LogLevel.WARNING;

            await this.logger.log(
                `Vracene ambalaze u dostupno stanje: ${releasedPackages}/${packageIds.length}`,
                level,
                {
                    additionalData: {
                        requested: packageIds.length,
                        released: releasedPackages,
                        type: this.profile.type,
                    },
                }
            );

            return releasedPackages;
        } catch (error) {
            await this.logger.log(
                `Greska pri vracanju ambalaza: ${(error as Error).message}`,
                LogLevel.ERROR,
                { additionalData: { packageCount: packageIds.length, type: this.profile.type } }
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

    private ensureValidPackageIds(packageIds: number[]): void {
        if (
            !Array.isArray(packageIds) ||
            packageIds.length === 0 ||
            packageIds.some((id) => !Number.isInteger(id) || id <= 0)
        ) {
            throw new Error("Neispravna lista identifikatora ambalaza");
        }
    }

    private async delay(ms: number): Promise<void> {
        await new Promise<void>((resolve) => setTimeout(resolve, ms));
    }
}
