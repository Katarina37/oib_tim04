import { CreateSaleDto, CreateSaleItemDto } from "../Domain/DTOs/CreateSaleDTO";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { SaleResponseDTO } from "../Domain/DTOs/SaleResponseDTO";
import { PaymentMethod } from "../Domain/enums/PaymentMethod";
import { SaleType } from "../Domain/enums/SaleType";
import { Sale } from "../Domain/models/Sale";
import { SaleItem } from "../Domain/models/SaleItem";
import { ISaleRepository } from "../Domain/repositories/ISaleRepository";
import { IAnalysisClient } from "../Domain/services/IAnalysisClient";
import { IAuditClient } from "../Domain/services/IAuditClient";
import { IPerfumeCatalogClient } from "../Domain/services/IPerfumeCatalogClient";
import { ISaleService } from "../Domain/services/ISaleService";
import { IStorageClient } from "../Domain/services/IStorageClient";
import { UserContext } from "../Domain/types/UserContext";

type ResolvedSaleItem = {
    perfumeId: number;
    name: string;
    quantity: number;
    price: number;
};

export class SaleService implements ISaleService {
    private static readonly MICROSERVICE_NAME = "sales-microservice";

    constructor(
        private readonly saleRepository: ISaleRepository,
        private readonly auditClient: IAuditClient,
        private readonly storageClient: IStorageClient,
        private readonly analysisClient: IAnalysisClient,
        private readonly perfumeCatalogClient: IPerfumeCatalogClient,
        private readonly fallbackPerfumeCatalogClient: IPerfumeCatalogClient
    ) {}

    async executeSale(data: CreateSaleDto, userContext: UserContext): Promise<SaleResponseDTO> {
        const catalog = await this.loadCatalogForCheckout(userContext, data.userId);
        const saleItems = this.resolveSaleItems(data.items, catalog);
        const requestedPerfumeIds = this.expandSaleItemsToPerfumeIds(saleItems);

        const requestedPackages = requestedPerfumeIds.length;

        const reservedPackageIds = await this.storageClient.reservePackagesByPerfumeIds(
            requestedPerfumeIds,
            userContext
        );
        const uniqueReservedPackageIds = this.deduplicatePositiveIds(reservedPackageIds);

        if (reservedPackageIds.length < requestedPackages) {
            await this.logInsufficientPackages(data.userId, requestedPackages, reservedPackageIds.length);
            await this.safeReleasePackages(uniqueReservedPackageIds, userContext, data.userId);
            throw new Error("Nema dovoljno paketa na stanju za izvršenje prodaje.");
        }

        try {
            const sentPackages = await this.storageClient.sendReservedPackages(
                uniqueReservedPackageIds,
                userContext
            );
            if (sentPackages < uniqueReservedPackageIds.length) {
                throw new Error(
                    `Nije moguce poslati svu rezervisanu ambalazu. Poslato: ${sentPackages}/${uniqueReservedPackageIds.length}.`
                );
            }

            const unpackedPackages = await this.storageClient.unpackPackages(
                uniqueReservedPackageIds,
                userContext
            );
            if (unpackedPackages < uniqueReservedPackageIds.length) {
                throw new Error(
                    `Nije moguce raspakovati svu poslatu ambalazu. Raspakovano: ${unpackedPackages}/${uniqueReservedPackageIds.length}.`
                );
            }

            const analysisResult = await this.analysisClient.createFiscalBill({
                saleType: data.type as SaleType,
                paymentMethod: data.paymentMethod as PaymentMethod,
                userId: data.userId,
                soldItems: saleItems.map((item) => ({
                    productId: item.perfumeId,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });

            const billNumber = this.resolveBillNumber(analysisResult.billId);
            const saleToPersist = await this.buildSaleForPersistence(
                data,
                saleItems,
                billNumber
            );

            const savedSale = await this.saleRepository.save(saleToPersist);

            await this.trySendAuditLog({
                tip_zapisa: "INFO",
                opis: `Izvrsena prodaja sa ID-jem ${savedSale.id} i brojem racuna ${savedSale.billNumber}.`,
                mikroservis: SaleService.MICROSERVICE_NAME,
                korisnik_id: data.userId,
                dodatni_podaci: {
                    saleId: savedSale.id,
                    total: savedSale.totalAmount,
                    billNumber: savedSale.billNumber,
                },
            });

            return this.toDTO(savedSale);
        } catch (error) {
            await this.safeReleasePackages(uniqueReservedPackageIds, userContext, data.userId);
            await this.trySendAuditLog({
                tip_zapisa: "ERROR",
                opis: `Prodaja neuspesna nakon rezervacije ambalaze: ${(error as Error).message}`,
                mikroservis: SaleService.MICROSERVICE_NAME,
                korisnik_id: data.userId,
                dodatni_podaci: {
                    reservedPackageIds: uniqueReservedPackageIds,
                },
            });
            throw error;
        }
    }

    async getSaleById(id: number): Promise<SaleResponseDTO> {
        const sale = await this.saleRepository.findById(id);

        if (!sale) {
            throw new Error(`Sale with ID ${id} not found.`);
        }

        return this.toDTO(sale);
    }

    async getAllSales(): Promise<SaleResponseDTO[]> {
        const sales = await this.saleRepository.findAll();
        return sales.map((sale) => this.toDTO(sale));
    }

    async getSaleByBillNumber(billNumber: string): Promise<SaleResponseDTO> {
        const sale = await this.saleRepository.findByBillNumber(billNumber);
        if (!sale) {
            throw new Error(`Sale with bill number ${billNumber} not found.`);
        }

        return this.toDTO(sale);
    }

    async deleteSale(id: number): Promise<void> {
        const sale = await this.saleRepository.findById(id);

        if (!sale) {
            throw new Error(`Sale with ID ${id} not found.`);
        }

        await this.saleRepository.remove(sale);

        await this.trySendAuditLog({
            tip_zapisa: "WARNING",
            opis: `Obrisan racun: ${sale.billNumber} sa ID-jem ${sale.id}.`,
            mikroservis: SaleService.MICROSERVICE_NAME,
            dodatni_podaci: { deletedSaleId: sale.id },
        });
    }

    async getAvailablePerfumes(userContext?: UserContext): Promise<PerfumeDTO[]> {
        try {
            const perfumes = await this.perfumeCatalogClient.getAvailablePerfumes(userContext);
            return perfumes.filter((perfume) => perfume.stock > 0);
        } catch (error) {
            await this.trySendAuditLog({
                tip_zapisa: "ERROR",
                opis: `Neuspesno preuzimanje dostupnih parfema: ${(error as Error).message}`,
                mikroservis: SaleService.MICROSERVICE_NAME,
                dodatni_podaci: { source: "perfume-catalog" },
            });

            const fallbackCatalog = await this.fallbackPerfumeCatalogClient.getAvailablePerfumes(userContext);
            const fallbackStock = await this.resolveSharedInventoryStock(userContext);
            const distributedStocks = this.distributeSharedStock(
                fallbackStock,
                fallbackCatalog.length
            );

            return fallbackCatalog
                .map((perfume, index) => ({
                    ...perfume,
                    stock: distributedStocks[index] ?? 0,
                }))
                .filter((perfume) => perfume.stock > 0);
        }
    }

    private toDTO(sale: Sale): SaleResponseDTO {
        return {
            id: sale.id,
            billNumber: sale.billNumber,
            type: sale.salesType,
            paymentMethod: sale.paymentMethod,
            totalAmount: sale.totalAmount,
            createdAt: sale.createdAt,
            items: sale.items.map((item) => ({
                perfumeName: item.perfumeName,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
            })),
        };
    }

    private async loadCatalogForCheckout(
        userContext: UserContext,
        userId: number
    ): Promise<PerfumeDTO[]> {
        try {
            const catalog = await this.getAvailablePerfumes(userContext);
            if (catalog.length === 0) {
                throw new Error("Katalog parfema je trenutno prazan.");
            }
            return catalog;
        } catch (error) {
            await this.trySendAuditLog({
                tip_zapisa: "ERROR",
                opis: `Neuspesno preuzimanje kataloga parfema za prodaju: ${(error as Error).message}`,
                mikroservis: SaleService.MICROSERVICE_NAME,
                korisnik_id: userId,
                dodatni_podaci: { source: "perfume-catalog" },
            });
            throw new Error("Katalog parfema trenutno nije dostupan.");
        }
    }

    private async resolveSharedInventoryStock(userContext?: UserContext): Promise<number> {
        try {
            const inventory = await this.storageClient.getInventory(userContext);
            const normalizedRole = userContext?.role?.toLowerCase();

            const stockCandidate =
                normalizedRole === "sales_manager"
                    ? inventory.distributiveCenter
                    : inventory.warehouseCenter;

            if (!Number.isFinite(stockCandidate) || stockCandidate < 0) {
                return 0;
            }

            return Math.floor(stockCandidate);
        } catch {
            return 0;
        }
    }

    private resolveSaleItems(items: CreateSaleItemDto[], catalog: PerfumeDTO[]): ResolvedSaleItem[] {
        const catalogById = new Map<number, PerfumeDTO>(
            catalog.map((perfume) => [perfume.id, perfume])
        );

        const resolvedItemsByPerfume = new Map<number, ResolvedSaleItem>();

        for (const item of items) {
            const perfume = catalogById.get(item.perfumeId);
            if (!perfume) {
                throw new Error(`Parfem sa ID-jem ${item.perfumeId} nije pronađen u katalogu.`);
            }

            const existing = resolvedItemsByPerfume.get(item.perfumeId);
            const nextQuantity = (existing?.quantity ?? 0) + item.quantity;

            if (nextQuantity > perfume.stock) {
                throw new Error(
                    `Nedovoljna dostupnost za parfem "${perfume.name}". Traženo: ${nextQuantity}, dostupno: ${perfume.stock}.`
                );
            }

            resolvedItemsByPerfume.set(item.perfumeId, {
                perfumeId: perfume.id,
                name: perfume.name,
                quantity: nextQuantity,
                price: perfume.price,
            });
        }

        return Array.from(resolvedItemsByPerfume.values());
    }

    private expandSaleItemsToPerfumeIds(saleItems: ResolvedSaleItem[]): number[] {
        const perfumeIds: number[] = [];
        for (const item of saleItems) {
            for (let index = 0; index < item.quantity; index += 1) {
                perfumeIds.push(item.perfumeId);
            }
        }
        return perfumeIds;
    }

    private distributeSharedStock(totalStock: number, bucketCount: number): number[] {
        if (bucketCount <= 0) {
            return [];
        }

        const normalizedTotal = Number.isFinite(totalStock) && totalStock > 0
            ? Math.floor(totalStock)
            : 0;

        const base = Math.floor(normalizedTotal / bucketCount);
        const remainder = normalizedTotal % bucketCount;

        return Array.from({ length: bucketCount }, (_unused, index) =>
            base + (index < remainder ? 1 : 0)
        );
    }

    private deduplicatePositiveIds(ids: number[]): number[] {
        const normalizedIds = ids.filter((id) => Number.isInteger(id) && id > 0);
        return Array.from(new Set(normalizedIds));
    }

    private async logInsufficientPackages(
        userId: number,
        requestedPackages: number,
        sentPackages: number
    ): Promise<void> {
        await this.trySendAuditLog({
            tip_zapisa: "ERROR",
            opis: `Nedovoljno paketa na stanju za prodaju. Zahtevano: ${requestedPackages}, poslato: ${sentPackages}.`,
            mikroservis: SaleService.MICROSERVICE_NAME,
            korisnik_id: userId,
            dodatni_podaci: {
                requested: requestedPackages,
                sent: sentPackages,
            },
        });
    }

    private async buildSaleForPersistence(
        data: CreateSaleDto,
        saleItems: ResolvedSaleItem[],
        billNumber: string
    ): Promise<Sale> {
        const newSale = await this.saleRepository.create({
            salesType: data.type as SaleType,
            paymentMethod: data.paymentMethod as PaymentMethod,
            totalAmount: 0,
            billNumber,
            items: [],
        });

        if (!newSale) {
            throw new Error("Failed to create a new sale.");
        }

        let totalAmount = 0;
        const domainItems = saleItems.map((itemDTO) => {
            const itemTotal = itemDTO.price * itemDTO.quantity;
            totalAmount += itemTotal;

            const item = new SaleItem();
            item.perfumeId = itemDTO.perfumeId;
            item.perfumeName = itemDTO.name;
            item.quantity = itemDTO.quantity;
            item.pricePerUnit = itemDTO.price;
            item.totalPrice = itemTotal;
            item.sale = newSale;

            return item;
        });

        newSale.items = domainItems;
        newSale.totalAmount = totalAmount;
        return newSale;
    }

    private resolveBillNumber(billId: number): string {
        if (!Number.isInteger(billId) || billId <= 0) {
            throw new Error("Analitika nije vratila validan broj fiskalnog racuna.");
        }

        const year = new Date().getFullYear(); 
        return `PP-${year}-${billId}`;
    }

    private async safeReleasePackages(
        packageIds: number[],
        userContext: UserContext,
        userId: number
    ): Promise<void> {
        if (packageIds.length === 0) {
            return;
        }

        try {
            const releasedPackages = await this.storageClient.releasePackages(
                packageIds,
                userContext
            );
            await this.trySendAuditLog({
                tip_zapisa: releasedPackages === packageIds.length ? "INFO" : "WARNING",
                opis: `Kompenzacija ambalaze nakon neuspele prodaje: ${releasedPackages}/${packageIds.length}.`,
                mikroservis: SaleService.MICROSERVICE_NAME,
                korisnik_id: userId,
                dodatni_podaci: {
                    packageIds,
                    releasedPackages,
                },
            });
        } catch (releaseError) {
            await this.trySendAuditLog({
                tip_zapisa: "ERROR",
                opis: `Neuspesna kompenzacija ambalaze: ${(releaseError as Error).message}`,
                mikroservis: SaleService.MICROSERVICE_NAME,
                korisnik_id: userId,
                dodatni_podaci: {
                    packageIds,
                },
            });
        }
    }

    private async trySendAuditLog(payload: {
        tip_zapisa: "INFO" | "WARNING" | "ERROR";
        opis: string;
        mikroservis: string;
        korisnik_id?: number;
        dodatni_podaci?: Record<string, unknown>;
    }): Promise<void> {
        try {
            await this.auditClient.sendLog(payload);
        } catch (auditError) {
            console.error("Audit log delivery failed:", (auditError as Error).message, payload);
        }
    }
}
