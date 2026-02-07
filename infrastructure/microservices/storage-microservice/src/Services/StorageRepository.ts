import { DataSource, In, QueryRunner, Repository } from "typeorm";
import { AppDataSource } from "../Database/DbConnectionPool";
import { AvailablePackagesDTO } from "../Domain/DTOs/AvailablePackagesDTO";
import { PackageSummaryDTO } from "../Domain/DTOs/PackageSummaryDTO";
import { WarehouseSummaryDTO } from "../Domain/DTOs/WarehouseSummaryDTO";
import { PackageState } from "../Domain/enums/PackageState";
import { Package } from "../Domain/models/Package";
import { PackagePerfume } from "../Domain/models/PackagePerfume";
import { Warehouse } from "../Domain/models/Warehouse";
import { IProcessingClient } from "../Domain/services/IProcessingClient";
import { IStorageRepository } from "../Domain/services/IStorageRepository";

export class StorageRepository implements IStorageRepository {
    private readonly packageRepo: Repository<Package>;
    private readonly warehouseRepo: Repository<Warehouse>;

    constructor(
        private readonly processingClient?: IProcessingClient,
        private readonly dataSource: DataSource = AppDataSource
    ) {
        this.packageRepo = dataSource.getRepository(Package);
        this.warehouseRepo = dataSource.getRepository(Warehouse);
    }

    async getAvailablePackages(): Promise<AvailablePackagesDTO> {
        const availableCount = await this.packageRepo.count({
            where: { state: PackageState.AVAILABLE },
        });

        return {
            distributiveCenter: availableCount,
            warehouseCenter: availableCount,
        };
    }

    async ensureAvailablePackages(quantity: number): Promise<number> {
        const availableCount = await this.packageRepo.count({
            where: { state: PackageState.AVAILABLE },
        });

        const missingPackages = quantity - availableCount;
        if (missingPackages <= 0) {
            return availableCount;
        }

        if (!this.processingClient) {
            return availableCount;
        }

        const perfumes = await this.processingClient.requestPerfumesForPackaging(missingPackages);
        const perfumeIds = perfumes.map((perfume) => Number(perfume.id)).filter((id) => id > 0);
        const createdPackages = await this.createPackagesFromPerfumes(perfumeIds);

        return availableCount + createdPackages;
    }

    async createPackagesFromPerfumes(perfumeIds: number[]): Promise<number> {
        if (!Array.isArray(perfumeIds) || perfumeIds.length === 0) {
            return 0;
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const warehouse = await this.resolveWarehouseForPackaging(queryRunner);
            const packageEntities = perfumeIds.map(() =>
                queryRunner.manager.create(Package, {
                    name: "Automatsko pakovanje",
                    sender: "Prerada sirovina",
                    state: PackageState.AVAILABLE,
                    warehouse,
                })
            );

            const savedPackages = await queryRunner.manager.save(Package, packageEntities);
            const perfumeLinks = savedPackages.map((savedPackage, index) =>
                queryRunner.manager.create(PackagePerfume, {
                    packageId: savedPackage.id,
                    perfumeId: perfumeIds[index],
                    package: savedPackage,
                })
            );

            await queryRunner.manager.save(PackagePerfume, perfumeLinks);
            await queryRunner.commitTransaction();
            return savedPackages.length;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async sendPackages(quantity: number): Promise<number> {
        const reservedPackageIds = await this.reservePackages(quantity);
        if (reservedPackageIds.length === 0) {
            return 0;
        }

        await this.markPackagesAsSent(reservedPackageIds);
        return reservedPackageIds.length;
    }

    async reservePackages(quantity: number): Promise<number[]> {
        await this.ensureAvailablePackages(quantity);

        const packages = await this.packageRepo.find({
            where: { state: PackageState.AVAILABLE },
            take: quantity,
            order: { id: "ASC" },
        });

        if (packages.length === 0) {
            return [];
        }

        for (const pkg of packages) {
            pkg.state = PackageState.RESERVED;
        }

        await this.packageRepo.save(packages);
        return packages.map((pkg) => pkg.id);
    }

    async markPackagesAsSent(packageIds: number[]): Promise<number> {
        if (packageIds.length === 0) {
            return 0;
        }

        const packages = await this.packageRepo.find({
            where: {
                id: In(packageIds),
                state: PackageState.RESERVED,
            },
            relations: ["warehouse"],
        });

        if (packages.length === 0) {
            return 0;
        }

        for (const pkg of packages) {
            pkg.state = PackageState.SENT;
            pkg.warehouse = null;
        }

        await this.packageRepo.save(packages);
        return packages.length;
    }

    async unpackPackages(packageIds: number[]): Promise<number> {
        if (packageIds.length === 0) {
            return 0;
        }

        const packages = await this.packageRepo.find({
            where: {
                id: In(packageIds),
                state: PackageState.SENT,
            },
        });

        if (packages.length === 0) {
            return 0;
        }

        for (const pkg of packages) {
            pkg.state = PackageState.UNPACKED;
        }

        await this.packageRepo.save(packages);
        return packages.length;
    }

    async releasePackages(packageIds: number[]): Promise<number> {
        if (packageIds.length === 0) {
            return 0;
        }

        const packages = await this.packageRepo.find({
            where: {
                id: In(packageIds),
                state: In([
                    PackageState.RESERVED,
                    PackageState.SENT,
                    PackageState.UNPACKED,
                ]),
            },
        });

        if (packages.length === 0) {
            return 0;
        }

        for (const pkg of packages) {
            pkg.state = PackageState.AVAILABLE;
        }

        await this.packageRepo.save(packages);
        return packages.length;
    }

    async getWarehouses(): Promise<WarehouseSummaryDTO[]> {
        const warehouses = await this.warehouseRepo
            .createQueryBuilder("warehouse")
            .loadRelationCountAndMap(
                "warehouse.usedCapacity",
                "warehouse.packages"
            )
            .getMany();

        return warehouses.map((w: any) => ({
            id: w.id,
            name: w.name,
            address: w.address,
            capacity: w.capacity,
            usedCapacity: w.usedCapacity ?? 0,
        }));
    }

    async getPackages(): Promise<PackageSummaryDTO[]> {
        const packages = await this.packageRepo.find({
            relations: {
                warehouse: true,
                perfumes: true,
            },
        });

        return packages.map((p) => ({
            id: p.id.toString(),
            sender: p.sender,
            perfumeCount: p.perfumes?.length ?? 0,
            warehouseName: p.warehouse?.name ?? "",
            status: p.state,
        }));
    }

    private async resolveWarehouseForPackaging(queryRunner: QueryRunner): Promise<Warehouse | null> {
        const [row] = await queryRunner.query(
            `
            SELECT
                s.id AS warehouseId
            FROM skladiste s
            LEFT JOIN ambalaza a ON a.skladiste_id = s.id
            GROUP BY s.id, s.maksimalni_kapacitet
            HAVING COUNT(a.id) < s.maksimalni_kapacitet
            ORDER BY COUNT(a.id) ASC, s.id ASC
            LIMIT 1
            `
        );

        const warehouseId = Number(row?.warehouseId ?? 0);
        if (!Number.isInteger(warehouseId) || warehouseId <= 0) {
            return null;
        }

        return queryRunner.manager.findOne(Warehouse, {
            where: { id: warehouseId },
        });
    }
}
