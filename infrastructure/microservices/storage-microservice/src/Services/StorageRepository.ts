import { In, Repository } from "typeorm";
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

    constructor() {
        this.packageRepo = AppDataSource.getRepository(Package);
        this.warehouseRepo = AppDataSource.getRepository(Warehouse);
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


}
