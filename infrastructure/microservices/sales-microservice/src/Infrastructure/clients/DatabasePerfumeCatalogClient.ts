import { DataSource } from "typeorm";
import { PerfumeDTO } from "../../Domain/DTOs/PerfumeDTO";
import { PerfumeType } from "../../Domain/enums/PerfumeType";
import { IPerfumeCatalogClient } from "../../Domain/services/IPerfumeCatalogClient";
import { IStorageClient } from "../../Domain/services/IStorageClient";
import { UserContext } from "../../Domain/types/UserContext";

type PerfumeCatalogRow = {
    id: number;
    name: string;
    type: string;
    volumeMl: number;
    serialNumber: string;
    plantId: number;
    expiryDate: string | Date;
    price: string | number | null;
};

const SALES_MANAGER_ROLE = "sales_manager";

export class DatabasePerfumeCatalogClient implements IPerfumeCatalogClient {
    constructor(
        private readonly dataSource: DataSource,
        private readonly storageClient: IStorageClient
    ) {}

    async getAvailablePerfumes(userContext?: UserContext): Promise<PerfumeDTO[]> {
        const [catalogRows, availablePackages] = await Promise.all([
            this.fetchCatalogRows(),
            this.getAvailablePackages(userContext),
        ]);

        return catalogRows.map((row) => this.toPerfumeDTO(row, availablePackages));
    }

    private async fetchCatalogRows(): Promise<PerfumeCatalogRow[]> {
        const rows = await this.dataSource.query(
            `
            SELECT
                p.id AS id,
                p.naziv AS name,
                p.tip AS type,
                p.neto_kolicina AS volumeMl,
                p.serijski_broj AS serialNumber,
                p.biljka_id AS plantId,
                p.rok_trajanja AS expiryDate,
                lp.price AS price
            FROM prerada.parfem p
            LEFT JOIN (
                SELECT
                    si.parfem_id AS perfumeId,
                    si.cena_po_komadu AS price
                FROM prodaja.stavka_racuna si
                INNER JOIN (
                    SELECT
                        parfem_id,
                        MAX(id) AS latestItemId
                    FROM prodaja.stavka_racuna
                    GROUP BY parfem_id
                ) last_ids ON last_ids.latestItemId = si.id
            ) lp ON lp.perfumeId = p.id
            ORDER BY p.id ASC
            `
        );

        return rows as PerfumeCatalogRow[];
    }

    private async getAvailablePackages(userContext?: UserContext): Promise<number> {
        try {
            const inventory = await this.storageClient.getInventory(userContext);
            const role = userContext?.role?.toLowerCase();

            const quantity =
                role === SALES_MANAGER_ROLE
                    ? inventory.distributiveCenter
                    : inventory.warehouseCenter;

            if (!Number.isFinite(quantity) || quantity < 0) {
                return 0;
            }

            return Math.floor(quantity);
        } catch {
            return 0;
        }
    }

    private toPerfumeDTO(row: PerfumeCatalogRow, availablePackages: number): PerfumeDTO {
        const type = this.normalizeType(row.type);
        const volumeMl = this.normalizeVolume(row.volumeMl);

        return {
            id: Number(row.id),
            name: row.name,
            type,
            volumeMl,
            serialNumber: row.serialNumber,
            plantId: Number(row.plantId),
            expiryDate: this.normalizeDate(row.expiryDate),
            price: this.normalizePrice(row.price, type, volumeMl),
            stock: availablePackages,
        };
    }

    private normalizeType(rawType: string): PerfumeType {
        return rawType === PerfumeType.COLOGNE_WATER
            ? PerfumeType.COLOGNE_WATER
            : PerfumeType.PERFUME;
    }

    private normalizeVolume(rawVolume: number): 150 | 250 {
        return rawVolume === 250 ? 250 : 150;
    }

    private normalizeDate(rawDate: string | Date): string {
        if (rawDate instanceof Date) {
            return rawDate.toISOString().slice(0, 10);
        }

        const parsed = new Date(rawDate);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().slice(0, 10);
        }

        return rawDate.slice(0, 10);
    }

    private normalizePrice(
        rawPrice: string | number | null,
        type: PerfumeType,
        volumeMl: 150 | 250
    ): number {
        const candidate =
            typeof rawPrice === "number"
                ? rawPrice
                : rawPrice !== null
                  ? Number(rawPrice)
                  : Number.NaN;

        if (Number.isFinite(candidate) && candidate > 0) {
            return candidate;
        }

        if (type === PerfumeType.PERFUME) {
            return volumeMl === 250 ? 12500 : 9900;
        }

        return volumeMl === 250 ? 9500 : 8900;
    }
}
