import { DataSource, In, Repository } from "typeorm";
import { AppDataSource } from "../Database/DbConnectionPool";
import { AvailablePackagesDTO } from "../Domain/DTOs/AvailablePackagesDTO";
import { PackageSummaryDTO } from "../Domain/DTOs/PackageSummaryDTO";
import { WarehouseSummaryDTO } from "../Domain/DTOs/WarehouseSummaryDTO";
import { PackageState } from "../Domain/enums/PackageState";
import { Package } from "../Domain/models/Package";
import { Warehouse } from "../Domain/models/Warehouse";
import { IStorageRepository } from "../Domain/services/IStorageRepository";

export class StorageRepository implements IStorageRepository {
    private readonly packageRepo: Repository<Package>;
    private readonly warehouseRepo: Repository<Warehouse>;

    constructor(private readonly dataSource: DataSource = AppDataSource) {
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

    async sendPackages(quantity: number): Promise<number> {
        const reservedPackageIds = await this.reservePackages(quantity);
        if (reservedPackageIds.length === 0) {
            return 0;
        }

        await this.markPackagesAsSent(reservedPackageIds);
        return reservedPackageIds.length;
    }

    async reservePackages(quantity: number): Promise<number[]> {
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

    async syncPackagedPackages(
        packageIds: number[],
        operation: "created" | "moved",
        targetWarehouseId?: number
    ): Promise<{ recordedPackages: number; missingPackages: number }> {
        if (!Array.isArray(packageIds) || packageIds.length === 0) {
            return { recordedPackages: 0, missingPackages: 0 };
        }

        const packages = await this.packageRepo.find({
            where: { id: In(packageIds) },
            relations: ["warehouse"],
        });

        if (packages.length === 0) {
            return {
                recordedPackages: 0,
                missingPackages: packageIds.length,
            };
        }

        let warehouse = undefined as Warehouse | undefined;
        if (targetWarehouseId !== undefined) {
            warehouse = await this.warehouseRepo.findOne({
                where: { id: targetWarehouseId },
            }) ?? undefined;

            if (!warehouse) {
                throw new Error(`Skladiste sa ID-jem ${targetWarehouseId} ne postoji.`);
            }
        }

        for (const pkg of packages) {
            pkg.state = operation === "moved" ? PackageState.SENT : PackageState.AVAILABLE;
            if (warehouse) {
                pkg.warehouse = warehouse;
            }
        }

        await this.packageRepo.save(packages);

        return {
            recordedPackages: packages.length,
            missingPackages: Math.max(0, packageIds.length - packages.length),
        };
    }

    async getWarehouses(): Promise<WarehouseSummaryDTO[]> {
        const rows = await this.warehouseRepo
            .createQueryBuilder("warehouse")
            .leftJoin(
                Package,
                "package",
                "package.skladiste_id = warehouse.id"
            )
            .select("warehouse.id", "id")
            .addSelect("warehouse.name", "name")
            .addSelect("warehouse.address", "address")
            .addSelect("warehouse.capacity", "capacity")
            .addSelect("COUNT(package.id)", "usedCapacity")
            .groupBy("warehouse.id")
            .addGroupBy("warehouse.name")
            .addGroupBy("warehouse.address")
            .addGroupBy("warehouse.capacity")
            .orderBy("warehouse.id", "ASC")
            .getRawMany<{
                id: number;
                name: string;
                address: string;
                capacity: number;
                usedCapacity: string;
            }>();

        return rows.map((row) => ({
            id: Number(row.id),
            name: row.name,
            address: row.address,
            capacity: Number(row.capacity),
            usedCapacity: Number.parseInt(row.usedCapacity, 10) || 0,
        }));
    }

    async getPackages(): Promise<PackageSummaryDTO[]> {
        const rows = await this.packageRepo
            .createQueryBuilder("package")
            .leftJoin(
                Warehouse,
                "warehouse",
                "warehouse.id = package.skladiste_id"
            )
            .leftJoin(
                "ambalaza_parfem",
                "package_perfume",
                "package_perfume.ambalaza_id = package.id"
            )
            .select("package.id", "id")
            .addSelect("package.sender", "sender")
            .addSelect("package.state", "status")
            .addSelect("warehouse.name", "warehouseName")
            .addSelect("COUNT(package_perfume.parfem_id)", "perfumeCount")
            .groupBy("package.id")
            .addGroupBy("package.sender")
            .addGroupBy("package.state")
            .addGroupBy("warehouse.name")
            .orderBy("package.id", "ASC")
            .getRawMany<{
                id: number;
                sender: string;
                status: PackageState;
                warehouseName: string | null;
                perfumeCount: string;
            }>();

        return rows.map((row) => ({
            id: String(row.id),
            sender: row.sender,
            perfumeCount: Number.parseInt(row.perfumeCount, 10) || 0,
            warehouseName: row.warehouseName ?? "",
            status: row.status,
        }));
    }

}
