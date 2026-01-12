import { Repository } from "typeorm";
import { Package } from "../Domain/models/Package";
import { IStorageRepository } from "../Domain/services/IStorageRepository";
import { AppDataSource } from "../Database/DbConnectionPool";
import { PackageState } from "../Domain/enums/PackageState";

export class StorageRepository implements IStorageRepository {
    private readonly repository: Repository<Package>;

    constructor() {
        this.repository = AppDataSource.getRepository(Package);
    }

    async getAvailablePackages(): Promise<number> {
        return this.repository.count({
            where: { state: PackageState.AVAILABLE },
        });
    }

    async sendPackages(quantity: number): Promise<number> {
        const packages = await this.repository.find({
            where: { state: PackageState.AVAILABLE },
            take: quantity,
        });

        if (packages.length === 0) return 0;

        for (const pkg of packages) {
            pkg.state = PackageState.SENT;
        }

        await this.repository.save(packages);
        return packages.length;
    }

    async addPackages(quantity: number): Promise<void> {
        const newPackage = this.repository.create({
            quantity,
            state: PackageState.AVAILABLE,
        });

        await this.repository.save(newPackage);
    }
}
