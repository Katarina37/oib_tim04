import { DataSource, In, QueryRunner, Repository } from "typeorm";
import { AppDataSource } from "../Database/DbConnectionPool";
import { PackageSummaryDTO } from "../Domain/DTOs/PackageSummaryDTO";
import { WarehouseSummaryDTO } from "../Domain/DTOs/WarehouseSummaryDTO";
import { PackageState } from "../Domain/enums/PackageState";
import { CreatePackagesOptions, PackagingRepositoryPort } from "../Application/ports/PackagingRepositoryPort";
import { PackageEntity } from "../Infrastructure/entities/PackageEntity";
import { PackagePerfumeEntity } from "../Infrastructure/entities/PackagePerfumeEntity";
import { WarehouseEntity } from "../Infrastructure/entities/WarehouseEntity";

export class PackagingRepository implements PackagingRepositoryPort {
  private readonly packageRepo: Repository<PackageEntity>;
  private readonly warehouseRepo: Repository<WarehouseEntity>;

  constructor(private readonly dataSource: DataSource = AppDataSource) {
    this.packageRepo = dataSource.getRepository(PackageEntity);
    this.warehouseRepo = dataSource.getRepository(WarehouseEntity);
  }

  async countAvailablePackages(): Promise<number> {
    return this.packageRepo.count({
      where: { state: PackageState.AVAILABLE },
    });
  }

  async createPackagesFromPerfumes(
    perfumeIds: number[],
    options: CreatePackagesOptions
  ): Promise<number[]> {
    if (!Array.isArray(perfumeIds) || perfumeIds.length === 0) {
      return [];
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedPackageIds: number[] = [];

      for (const perfumeId of perfumeIds) {
        const warehouse = await this.resolveTargetWarehouseForPackaging(
          queryRunner,
          options.targetWarehouseId
        );
        const packageEntity = queryRunner.manager.create(PackageEntity, {
          name: options.packageName,
          sender: options.senderAddress,
          state: PackageState.AVAILABLE,
          warehouse,
        });

        const savedPackage = await queryRunner.manager.save(PackageEntity, packageEntity);
        const link = queryRunner.manager.create(PackagePerfumeEntity, {
          packageId: savedPackage.id,
          perfumeId,
          package: savedPackage,
        });

        await queryRunner.manager.save(PackagePerfumeEntity, link);
        savedPackageIds.push(savedPackage.id);
      }

      await queryRunner.commitTransaction();
      return savedPackageIds;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async sendPackagesToWarehouse(
    packageIds: number[],
    targetWarehouseId: number
  ): Promise<number[]> {
    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      return [];
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const warehouse = await this.resolveTargetWarehouseForPackaging(
        queryRunner,
        targetWarehouseId
      );

      if (!warehouse) {
        throw new Error("Ciljno skladiste nije pronadjeno.");
      }

      const packages = await queryRunner.manager.find(PackageEntity, {
        where: {
          id: In(packageIds),
          state: PackageState.AVAILABLE,
        },
        order: { id: "ASC" },
      });

      if (packages.length === 0) {
        await queryRunner.commitTransaction();
        return [];
      }

      const movedPackageIds: number[] = [];
      for (const packaging of packages) {
        const canFit = await this.canWarehouseAcceptAnotherPackage(
          queryRunner,
          warehouse.id
        );
        if (!canFit) {
          break;
        }

        packaging.warehouse = warehouse;
        await queryRunner.manager.save(PackageEntity, packaging);
        movedPackageIds.push(packaging.id);
      }

      await queryRunner.commitTransaction();
      return movedPackageIds;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWarehouses(): Promise<WarehouseSummaryDTO[]> {
    const warehouses = await this.warehouseRepo
      .createQueryBuilder("warehouse")
      .loadRelationCountAndMap("warehouse.usedCapacity", "warehouse.packages")
      .getMany();

    return warehouses.map((warehouse: any) => ({
      id: warehouse.id,
      name: warehouse.name,
      address: warehouse.address,
      capacity: warehouse.capacity,
      usedCapacity: warehouse.usedCapacity ?? 0,
    }));
  }

  async getPackages(): Promise<PackageSummaryDTO[]> {
    const packages = await this.packageRepo.find({
      relations: {
        warehouse: true,
        perfumes: true,
      },
    });

    return packages.map((packaging) => ({
      id: packaging.id.toString(),
      sender: packaging.sender,
      perfumeCount: packaging.perfumes?.length ?? 0,
      warehouseName: packaging.warehouse?.name ?? "",
      status: packaging.state,
    }));
  }

  private async resolveTargetWarehouseForPackaging(
    queryRunner: QueryRunner,
    targetWarehouseId?: number
  ): Promise<WarehouseEntity | null> {
    if (targetWarehouseId === undefined) {
      return null;
    }

    const warehouse = await queryRunner.manager.findOne(WarehouseEntity, {
      where: { id: targetWarehouseId },
    });

    if (!warehouse) {
      throw new Error(`Skladiste sa ID-jem ${targetWarehouseId} ne postoji.`);
    }

    const canFit = await this.canWarehouseAcceptAnotherPackage(queryRunner, targetWarehouseId);
    if (!canFit) {
      throw new Error(`Skladiste sa ID-jem ${targetWarehouseId} nema slobodan kapacitet.`);
    }

    return warehouse;
  }

  private async canWarehouseAcceptAnotherPackage(
    queryRunner: QueryRunner,
    warehouseId: number
  ): Promise<boolean> {
    const [row] = await queryRunner.query(
      `
      SELECT
          s.id AS warehouseId,
          s.maksimalni_kapacitet AS capacity,
          COUNT(a.id) AS usedCapacity
      FROM skladiste s
      LEFT JOIN ambalaza a ON a.skladiste_id = s.id
      WHERE s.id = ?
      GROUP BY s.id, s.maksimalni_kapacitet
      `,
      [warehouseId]
    );

    if (!row) {
      return false;
    }

    const capacity = Number(row.capacity ?? 0);
    const usedCapacity = Number(row.usedCapacity ?? 0);
    return Number.isFinite(capacity) && Number.isFinite(usedCapacity) && usedCapacity < capacity;
  }
}
