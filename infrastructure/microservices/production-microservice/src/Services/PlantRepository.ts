import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere } from "typeorm";
import { Plant } from "../Domain/models/Plant";
import { IPlantRepository } from "../Domain/services/IPlantRepository";
import { CreatePlantDTO } from "../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../Domain/DTOs/UpdatePlantDTO";
import { PlantSearchCriteriaDTO, PlantSortField, SortDirection } from "../Domain/DTOs/PlantSearchCriteriaDTO";
import { PlantState } from "../Domain/enums/PlantState";
import { AppDataSource } from "../Database/DbConnectionPool";

export class PlantRepository implements IPlantRepository {
  private readonly repository: Repository<Plant>;

  constructor() {
    this.repository = AppDataSource.getRepository(Plant);
  }

  async findAll(criteria: PlantSearchCriteriaDTO = {}): Promise<Plant[]> {
    return this.repository.find({
      order: this.buildOrder(criteria.sortBy, criteria.sortDirection),
    });
  }

  async findById(id: number): Promise<Plant | null> {
    return this.repository.findOneBy({ id });
  }

  async findByState(state: PlantState, criteria: PlantSearchCriteriaDTO = {}): Promise<Plant[]> {
    return this.repository.find({
      where: { state },
      order: this.buildOrder(criteria.sortBy, criteria.sortDirection),
    });
  }

  async findByCommonName(commonName: string, criteria: PlantSearchCriteriaDTO = {}): Promise<Plant[]> {
    return this.repository.find({
      where: { commonName: Like(`%${commonName}%`) },
      order: this.buildOrder(criteria.sortBy, criteria.sortDirection),
    });
  }

  async findByCriteria(criteria: PlantSearchCriteriaDTO): Promise<Plant[]> {
    const where: FindOptionsWhere<Plant> = {};

    if (criteria.searchTerm) {
      const baseWhere = this.buildBaseWhere(criteria);
      return this.repository.find({
        where: [
          { ...baseWhere, commonName: Like(`%${criteria.searchTerm}%`) },
          { ...baseWhere, latinName: Like(`%${criteria.searchTerm}%`) },
        ],
        order: this.buildOrder(criteria.sortBy, criteria.sortDirection),
      });
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

    return this.repository.find({
      where,
      order: this.buildOrder(criteria.sortBy, criteria.sortDirection),
    });
  }

  async create(data: CreatePlantDTO): Promise<Plant> {
    const plant = this.repository.create({
      commonName: data.commonName,
      latinName: data.latinName,
      countryOfOrigin: data.countryOfOrigin,
      oilStrength: data.oilStrength ?? this.generateRandomOilStrength(),
      state: PlantState.PLANTED,
    });

    return this.repository.save(plant);
  }

  async update(id: number, data: UpdatePlantDTO): Promise<Plant> {
    const plant = await this.findById(id);
    
    if (!plant) {
      throw new Error(`Plant with ID ${id} not found`);
    }

    Object.assign(plant, data);
    return this.repository.save(plant);
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
    const allowedFields: Record<PlantSortField, keyof Plant> = {
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

  private buildBaseWhere(criteria: PlantSearchCriteriaDTO): FindOptionsWhere<Plant> {
    const where: FindOptionsWhere<Plant> = {};

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
