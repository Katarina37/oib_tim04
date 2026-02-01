import { Repository } from "typeorm";
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
        const packages = await this.packageRepo.find({
            where: { state: PackageState.AVAILABLE },
            take: quantity,
            relations: ["warehouse"],
        });

        for (const pkg of packages) {
            pkg.state = PackageState.SENT;
            pkg.warehouse = null;
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
