import {
  Between,
  DataSource,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { Plant } from "../Domain/models/Plant";
import { IPlantRepository } from "../Domain/services/IPlantRepository";
import { CreatePlantDTO } from "../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../Domain/DTOs/UpdatePlantDTO";
import {
  PlantSearchCriteriaDTO,
  PlantSortField,
  SortDirection,
} from "../Domain/DTOs/PlantSearchCriteriaDTO";
import { PlantState } from "../Domain/enums/PlantState";
import { PlantEntity } from "../Infrastructure/entities/PlantEntity";

export class PlantRepository implements IPlantRepository {
  private readonly repository: Repository<PlantEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(PlantEntity);
  }

  async findAll(criteria: PlantSearchCriteriaDTO = {}): Promise<Plant[]> {
    const rows = await this.repository.find({
      order: this.buildOrder(criteria.sortBy, criteria.sortDirection),
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number): Promise<Plant | null> {
    const row = await this.repository.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findByState(
    state: PlantState,
    criteria: PlantSearchCriteriaDTO = {}
  ): Promise<Plant[]> {
    const rows = await this.repository.find({
      where: { state },
      order: this.buildOrder(criteria.sortBy, criteria.sortDirection),
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findByCommonName(
    commonName: string,
    criteria: PlantSearchCriteriaDTO = {}
  ): Promise<Plant[]> {
    const rows = await this.repository.find({
      where: { commonName: Like(`%${commonName}%`) },
      order: this.buildOrder(criteria.sortBy, criteria.sortDirection),
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findByCriteria(criteria: PlantSearchCriteriaDTO): Promise<Plant[]> {
    const where: FindOptionsWhere<PlantEntity> = {};

    if (criteria.searchTerm) {
      const baseWhere = this.buildBaseWhere(criteria);
      const rows = await this.repository.find({
        where: [
          { ...baseWhere, commonName: Like(`%${criteria.searchTerm}%`) },
          { ...baseWhere, latinName: Like(`%${criteria.searchTerm}%`) },
        ],
        order: this.buildOrder(criteria.sortBy, criteria.sortDirection),
      });

      return rows.map((row) => this.toDomain(row));
    }

    if (criteria.commonName) {
      where.commonName = Like(`%${criteria.commonName}%`);
    }

    if (criteria.latinName) {
      where.latinName = Like(`%${criteria.latinName}%`);
    }

    if (criteria.countryOfOrigin) {
      where.countryOfOrigin = Like(`%${criteria.countryOfOrigin}%`);
    }

    if (criteria.state) {
      where.state = criteria.state;
    }

    if (criteria.minOilStrength !== undefined && criteria.maxOilStrength !== undefined) {
      where.oilStrength = Between(criteria.minOilStrength, criteria.maxOilStrength);
    } else if (criteria.minOilStrength !== undefined) {
      where.oilStrength = MoreThanOrEqual(criteria.minOilStrength);
    } else if (criteria.maxOilStrength !== undefined) {
      where.oilStrength = LessThanOrEqual(criteria.maxOilStrength);
    }

    const rows = await this.repository.find({
      where,
      order: this.buildOrder(criteria.sortBy, criteria.sortDirection),
    });

    return rows.map((row) => this.toDomain(row));
  }

  async create(data: CreatePlantDTO): Promise<Plant> {
    const plant = this.repository.create({
      commonName: data.commonName,
      latinName: data.latinName,
      countryOfOrigin: data.countryOfOrigin,
      oilStrength: data.oilStrength ?? this.generateRandomOilStrength(),
      state: PlantState.PLANTED,
    });

    const saved = await this.repository.save(plant);
    return this.toDomain(saved);
  }

  async update(id: number, data: UpdatePlantDTO): Promise<Plant> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new Error(`Plant with ID ${id} not found`);
    }

    Object.assign(entity, data);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);

    if (result.affected === 0) {
      throw new Error(`Plant with ID ${id} not found`);
    }
  }

  async countByCommonNameAndState(commonName: string, state: PlantState): Promise<number> {
    return this.repository.count({
      where: {
        commonName,
        state,
      },
    });
  }

  private toDomain(entity: PlantEntity): Plant {
    const plant = new Plant();
    plant.id = entity.id;
    plant.commonName = entity.commonName;
    plant.oilStrength = Number(entity.oilStrength);
    plant.latinName = entity.latinName;
    plant.countryOfOrigin = entity.countryOfOrigin;
    plant.state = entity.state;
    plant.createdAt = entity.createdAt;
    plant.updatedAt = entity.updatedAt;
    return plant;
  }

  private generateRandomOilStrength(): number {
    const min = 1.0;
    const max = 5.0;
    const value = Math.random() * (max - min) + min;
    return Math.round(value * 10) / 10;
  }

  private buildOrder(
    sortBy: PlantSortField | undefined,
    sortDirection: SortDirection | undefined
  ): Record<string, "ASC" | "DESC"> {
    const direction: SortDirection = sortDirection === "ASC" ? "ASC" : "DESC";
    const allowedFields: Record<PlantSortField, keyof PlantEntity> = {
      createdAt: "createdAt",
      commonName: "commonName",
      latinName: "latinName",
      countryOfOrigin: "countryOfOrigin",
      state: "state",
      oilStrength: "oilStrength",
    };

    if (sortBy && allowedFields[sortBy]) {
      return { [allowedFields[sortBy]]: direction };
    }

    return { createdAt: "DESC" };
  }

  private buildBaseWhere(criteria: PlantSearchCriteriaDTO): FindOptionsWhere<PlantEntity> {
    const where: FindOptionsWhere<PlantEntity> = {};

    if (criteria.countryOfOrigin) {
      where.countryOfOrigin = Like(`%${criteria.countryOfOrigin}%`);
    }

    if (criteria.state) {
      where.state = criteria.state;
    }

    if (criteria.minOilStrength !== undefined && criteria.maxOilStrength !== undefined) {
      where.oilStrength = Between(criteria.minOilStrength, criteria.maxOilStrength);
    } else if (criteria.minOilStrength !== undefined) {
      where.oilStrength = MoreThanOrEqual(criteria.minOilStrength);
    } else if (criteria.maxOilStrength !== undefined) {
      where.oilStrength = LessThanOrEqual(criteria.maxOilStrength);
    }

    return where;
  }
}
