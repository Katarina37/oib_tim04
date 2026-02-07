import { DataSource, QueryRunner } from "typeorm";
import { PerfumeBatchDTO } from "../Domain/DTOs/PerfumeBatchDTO";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import {
  PerfumeSearchCriteriaDTO,
  PerfumeSortField,
  SortDirection,
} from "../Domain/DTOs/PerfumeSearchCriteriaDTO";
import { BottleVolume } from "../Domain/enums/BottleVolume";
import { PerfumeType } from "../Domain/enums/PerfumeType";
import {
  IProcessingRepository,
  ProcessingContext,
  ProcessingResult,
} from "../Domain/services/IProcessingRepository";
import { Perfume } from "../Domain/models/Perfume";
import { PerfumeEntity } from "../Infrastructure/entities/PerfumeEntity";

type PerfumeRow = {
  id: number;
  name: string;
  type: PerfumeType;
  netVolumeMl: number;
  serialNumber: string;
  plantId: number;
  expiryDate: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  isPackaged: boolean | number;
};

type ProcessingStatsRow = {
  totalPerfumes: number;
  availableForPackaging: number;
  perfumeCount: number;
  cologneCount: number;
};

export class ProcessingRepository implements IProcessingRepository {
  constructor(private readonly dataSource: DataSource) {}

  async startProcessing(context: ProcessingContext): Promise<ProcessingResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    const { perfumeData, requiredPlantCount, harvestedPlantIds, plantsPerBottle } = context;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (harvestedPlantIds.length < requiredPlantCount) {
        throw new Error(
          `Nedovoljno ubranih biljaka za preradu. Dostupno: ${harvestedPlantIds.length}, potrebno: ${requiredPlantCount}.`
        );
      }

      const usedPlantIds = harvestedPlantIds.slice(0, requiredPlantCount);
      const serialStart = await this.resolveSerialStart(queryRunner);

      const perfumesToCreate: PerfumeEntity[] = [];
      for (let bottleIndex = 0; bottleIndex < perfumeData.bottleQuantity; bottleIndex += 1) {
        const plantOffset = bottleIndex * plantsPerBottle;
        const plantForBottle = usedPlantIds[plantOffset];
        if (!Number.isInteger(plantForBottle) || plantForBottle <= 0) {
          throw new Error("Nije moguce dodeliti biljku svakoj bocici tokom prerade.");
        }

        const perfume = queryRunner.manager.create(PerfumeEntity, {
          name: perfumeData.perfumeName.trim(),
          type: perfumeData.perfumeType,
          netVolumeMl: perfumeData.bottleVolumeMl,
          serialNumber: this.buildSerialNumber(serialStart + bottleIndex),
          plantId: plantForBottle,
          expiryDate: this.resolveExpiryDate(),
          isPackaged: false,
        });

        perfumesToCreate.push(perfume);
      }

      const savedPerfumes = await queryRunner.manager.save(PerfumeEntity, perfumesToCreate);

      await queryRunner.commitTransaction();
      return {
        createdPerfumes: savedPerfumes.map((perfume) => this.toDomain(perfume)),
        usedPlantIds,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findPerfumes(criteria: PerfumeSearchCriteriaDTO = {}): Promise<PerfumeDTO[]> {
    const { whereClause, params } = this.buildWhereClause(criteria, {
      forceOnlyAvailable: false,
    });

    const { orderByColumn, direction } = this.resolveSort(
      criteria.sortBy,
      criteria.sortDirection
    );

    const rows = await this.dataSource.query(
      `
        SELECT
          p.id AS id,
          p.naziv AS name,
          p.tip AS type,
          p.neto_kolicina AS netVolumeMl,
          p.serijski_broj AS serialNumber,
          p.biljka_id AS plantId,
          p.rok_trajanja AS expiryDate,
          p.datum_kreiranja AS createdAt,
          p.datum_azuriranja AS updatedAt,
          p.spakovan AS isPackaged
        FROM parfem p
        ${whereClause}
        ORDER BY ${orderByColumn} ${direction}
      `,
      params
    );

    return (rows as PerfumeRow[]).map((row) => this.mapRowToDTO(row));
  }

  async requestPerfumesForPackaging(criteria: {
    quantity: number;
    perfumeType?: PerfumeType;
    perfumeName?: string;
    bottleVolumeMl?: BottleVolume;
  }): Promise<PerfumeBatchDTO> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { whereClause, params } = this.buildWhereClause(
        {
          perfumeType: criteria.perfumeType,
          perfumeName: criteria.perfumeName,
          bottleVolumeMl: criteria.bottleVolumeMl,
        },
        { forceOnlyAvailable: true }
      );

      const rows = await queryRunner.query(
        `
          SELECT
            p.id AS id,
            p.naziv AS name,
            p.tip AS type,
            p.neto_kolicina AS netVolumeMl,
            p.serijski_broj AS serialNumber,
            p.biljka_id AS plantId,
            p.rok_trajanja AS expiryDate,
            p.datum_kreiranja AS createdAt,
            p.datum_azuriranja AS updatedAt,
            p.spakovan AS isPackaged
          FROM parfem p
          ${whereClause}
          ORDER BY p.id ASC
          LIMIT ?
          FOR UPDATE
        `,
        [...params, criteria.quantity]
      );

      const perfumes = (rows as PerfumeRow[]).map((row) => this.mapRowToDTO(row));
      if (perfumes.length === 0) {
        await queryRunner.commitTransaction();
        return {
          requestedQuantity: criteria.quantity,
          returnedQuantity: 0,
          perfumes: [],
        };
      }

      const selectedPerfumeIds = perfumes.map((perfume) => perfume.id);
      const idPlaceholders = selectedPerfumeIds.map(() => "?").join(", ");

      await queryRunner.query(
        `
          UPDATE parfem
          SET spakovan = 1
          WHERE id IN (${idPlaceholders})
        `,
        selectedPerfumeIds
      );

      await queryRunner.commitTransaction();

      return {
        requestedQuantity: criteria.quantity,
        returnedQuantity: perfumes.length,
        perfumes: perfumes.map((perfume) => ({
          ...perfume,
          isPackaged: true,
        })),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProcessingStats(): Promise<{
    totalPerfumes: number;
    availableForPackaging: number;
    perfumeCount: number;
    cologneCount: number;
  }> {
    const [row] = await this.dataSource.query(
      `
        SELECT
          COUNT(*) AS totalPerfumes,
          SUM(CASE WHEN p.spakovan = 0 THEN 1 ELSE 0 END) AS availableForPackaging,
          SUM(CASE WHEN p.tip = 'parfem' THEN 1 ELSE 0 END) AS perfumeCount,
          SUM(CASE WHEN p.tip = 'kolonjska_voda' THEN 1 ELSE 0 END) AS cologneCount
        FROM parfem p
      `
    );

    const stats = row as ProcessingStatsRow | undefined;
    return {
      totalPerfumes: Number(stats?.totalPerfumes ?? 0),
      availableForPackaging: Number(stats?.availableForPackaging ?? 0),
      perfumeCount: Number(stats?.perfumeCount ?? 0),
      cologneCount: Number(stats?.cologneCount ?? 0),
    };
  }

  private async resolveSerialStart(queryRunner: QueryRunner): Promise<number> {
    const [row] = await queryRunner.query(`
      SELECT MAX(id) AS maxId
      FROM parfem
    `);

    const maxId = Number(row?.maxId ?? 0);
    return Number.isFinite(maxId) ? maxId + 1 : 1;
  }

  private buildSerialNumber(index: number): string {
    return `PP-2025-${index}`;
  }

  private resolveExpiryDate(): string {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);
    return expiryDate.toISOString().slice(0, 10);
  }

  private mapRowToDTO(row: PerfumeRow): PerfumeDTO {
    return {
      id: Number(row.id),
      name: row.name,
      type: row.type,
      netVolumeMl: Number(row.netVolumeMl),
      serialNumber: row.serialNumber,
      plantId: Number(row.plantId),
      expiryDate: this.normalizeDate(row.expiryDate),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      isPackaged: Boolean(Number(row.isPackaged)),
    };
  }

  private toDomain(entity: PerfumeEntity): Perfume {
    const perfume = new Perfume();
    perfume.id = entity.id;
    perfume.name = entity.name;
    perfume.type = entity.type;
    perfume.netVolumeMl = Number(entity.netVolumeMl);
    perfume.serialNumber = entity.serialNumber;
    perfume.plantId = Number(entity.plantId);
    perfume.expiryDate = this.normalizeDate(entity.expiryDate);
    perfume.isPackaged = Boolean(entity.isPackaged);
    perfume.createdAt = entity.createdAt;
    perfume.updatedAt = entity.updatedAt;
    return perfume;
  }

  private normalizeDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toISOString().slice(0, 10);
  }

  private buildWhereClause(
    criteria: Pick<
      PerfumeSearchCriteriaDTO,
      "perfumeName" | "perfumeType" | "bottleVolumeMl" | "onlyAvailableForPackaging"
    >,
    options: { forceOnlyAvailable: boolean }
  ): { whereClause: string; params: Array<string | number> } {
    const whereParts: string[] = [];
    const params: Array<string | number> = [];

    if (criteria.perfumeName) {
      whereParts.push("p.naziv LIKE ?");
      params.push(`%${criteria.perfumeName.trim()}%`);
    }

    if (criteria.perfumeType) {
      whereParts.push("p.tip = ?");
      params.push(criteria.perfumeType);
    }

    if (criteria.bottleVolumeMl) {
      whereParts.push("p.neto_kolicina = ?");
      params.push(criteria.bottleVolumeMl);
    }

    if (options.forceOnlyAvailable || criteria.onlyAvailableForPackaging) {
      whereParts.push("p.spakovan = 0");
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";
    return { whereClause, params };
  }

  private resolveSort(
    sortBy: PerfumeSortField | undefined,
    sortDirection: SortDirection | undefined
  ): { orderByColumn: string; direction: SortDirection } {
    const direction: SortDirection = sortDirection === "ASC" ? "ASC" : "DESC";
    const sortMap: Record<PerfumeSortField, string> = {
      createdAt: "p.datum_kreiranja",
      name: "p.naziv",
      type: "p.tip",
      netVolumeMl: "p.neto_kolicina",
      expiryDate: "p.rok_trajanja",
    };
    const resolvedColumn = sortBy ? sortMap[sortBy] : undefined;

    return {
      orderByColumn: resolvedColumn || "p.datum_kreiranja",
      direction,
    };
  }
}
