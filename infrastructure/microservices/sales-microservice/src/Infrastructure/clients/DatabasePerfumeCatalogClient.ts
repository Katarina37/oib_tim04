import axios, { AxiosInstance } from "axios";
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

type ProcessingPerfumeResponse = {
    id: number;
    name: string;
    type: string;
    netVolumeMl: number;
    serialNumber: string;
    plantId: number;
    expiryDate: string;
};

type LatestPriceRow = {
    perfumeId: number;
    price: string | number;
};

const SALES_MANAGER_ROLE = "sales_manager";

export class DatabasePerfumeCatalogClient implements IPerfumeCatalogClient {
    private readonly processingHttp: AxiosInstance;

    constructor(
        private readonly dataSource: DataSource,
        private readonly storageClient: IStorageClient,
        processingBaseUrl: string,
        gatewayKey: string
    ) {
        this.processingHttp = axios.create({
            baseURL: this.normalizeApiBaseUrl(processingBaseUrl),
            headers: {
                "Content-Type": "application/json",
                "X-Gateway-Key": gatewayKey,
            },
            timeout: 5000,
        });
    }

    async getAvailablePerfumes(userContext?: UserContext): Promise<PerfumeDTO[]> {
        const [catalogRows, availablePackages] = await Promise.all([
            this.fetchCatalogRows(),
            this.getAvailablePackages(userContext),
        ]);

        return catalogRows.map((row) => this.toPerfumeDTO(row, availablePackages));
    }

    private async fetchCatalogRows(): Promise<PerfumeCatalogRow[]> {
        const [processingRows, latestPrices] = await Promise.all([
            this.fetchProcessingPerfumes(),
            this.fetchLatestPrices(),
        ]);

        const priceByPerfumeId = new Map<number, string | number>(
            latestPrices.map((row) => [Number(row.perfumeId), row.price])
        );

        return processingRows.map((row) => ({
            id: Number(row.id),
            name: row.name,
            type: row.type,
            volumeMl: Number(row.netVolumeMl),
            serialNumber: row.serialNumber,
            plantId: Number(row.plantId),
            expiryDate: row.expiryDate,
            price: priceByPerfumeId.get(Number(row.id)) ?? null,
        }));
    }

    private async fetchProcessingPerfumes(): Promise<ProcessingPerfumeResponse[]> {
        const response = await this.processingHttp.get<unknown>("/processing/perfumes", {
            params: {
                sortBy: "createdAt",
                sortDirection: "DESC",
            },
        });

        const payload = response.data as unknown;
        if (Array.isArray(payload)) {
            return payload as ProcessingPerfumeResponse[];
        }

        if (
            payload &&
            typeof payload === "object" &&
            "data" in payload &&
            Array.isArray((payload as { data?: unknown }).data)
        ) {
            return (payload as { data: ProcessingPerfumeResponse[] }).data;
        }

        throw new Error("Nevalidan odgovor prerade pri preuzimanju kataloga parfema.");
    }

    private async fetchLatestPrices(): Promise<LatestPriceRow[]> {
        const rows = await this.dataSource.query(
            `
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
            `
        );

        return rows as LatestPriceRow[];
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

    private normalizeApiBaseUrl(baseURL: string): string {
        const trimmed = baseURL.trim().replace(/\/+$/, "");
        if (!trimmed) {
            return trimmed;
        }

        return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
    }
}
