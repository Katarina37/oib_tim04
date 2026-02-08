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

type PerfumeStockRow = {
    perfumeId: number;
    stock: string | number;
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
        const [catalogRows, stockByPerfume, roleInventoryLimit] = await Promise.all([
            this.fetchCatalogRows(),
            this.fetchAvailablePerfumeStocks(),
            this.getRoleInventoryLimit(userContext),
        ]);

        return catalogRows.map((row) => {
            const perfumeSpecificStock = stockByPerfume.get(Number(row.id)) ?? 0;
            const stock =
                roleInventoryLimit === null
                    ? perfumeSpecificStock
                    : Math.min(perfumeSpecificStock, roleInventoryLimit);

            return this.toPerfumeDTO(row, stock);
        });
    }

    private async fetchCatalogRows(): Promise<PerfumeCatalogRow[]> {
        const processingRows = await this.fetchProcessingPerfumes();

        return processingRows.map((row) => ({
            id: Number(row.id),
            name: row.name,
            type: row.type,
            volumeMl: Number(row.netVolumeMl),
            serialNumber: row.serialNumber,
            plantId: Number(row.plantId),
            expiryDate: row.expiryDate,
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

    private async fetchAvailablePerfumeStocks(): Promise<Map<number, number>> {
        const rows = await this.dataSource.query(
            `
            SELECT
                ap.parfem_id AS perfumeId,
                COUNT(*) AS stock
            FROM skladista.ambalaza_parfem ap
            INNER JOIN skladista.ambalaza a ON a.id = ap.ambalaza_id
            WHERE a.status = 'spakovana'
            GROUP BY ap.parfem_id
            `
        );

        const mappedRows = rows as PerfumeStockRow[];
        return new Map<number, number>(
            mappedRows.map((row) => [Number(row.perfumeId), Number(row.stock)])
        );
    }

    private async getRoleInventoryLimit(userContext?: UserContext): Promise<number | null> {
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
            return null;
        }
    }

    private toPerfumeDTO(row: PerfumeCatalogRow, stock: number): PerfumeDTO {
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
            price: this.resolveCatalogPrice(type, volumeMl),
            stock: Math.max(0, Math.floor(stock)),
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

    // Cenovnik je deterministicki po tipu i zapremini; nije vezan za istoriju prodaje.
    private resolveCatalogPrice(type: PerfumeType, volumeMl: 150 | 250): number {
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
