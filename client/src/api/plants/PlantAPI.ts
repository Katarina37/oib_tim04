import {
  ChangeOilStrengthDTO,
  HarvestPlantsDTO,
  PlantDTO,
  PlantSearchCriteriaDTO,
} from "../../models/plants/PlantDTO";
import { IPlantAPI } from "./IPlantAPI";
import { IHttpClient } from "../http/IHttpClient";

export class PlantAPI implements IPlantAPI {
  constructor(private readonly httpClient: IHttpClient) {}

  private readonly basePath = "/production";

  private getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  private unwrapResponse<T>(data: unknown): T {
    // Some services wrap payloads in { data }, others return raw DTOs
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: T }).data;
    }
    return data as T;
  }

  private buildQueryParams(criteria?: PlantSearchCriteriaDTO): Record<string, unknown> | undefined {
    if (!criteria) return undefined;

    return {
      ...(criteria.commonName ? { commonName: criteria.commonName } : {}),
      ...(criteria.latinName ? { latinName: criteria.latinName } : {}),
      ...(criteria.countryOfOrigin ? { countryOfOrigin: criteria.countryOfOrigin } : {}),
      ...(criteria.state ? { state: criteria.state } : {}),
      ...(criteria.minOilStrength !== undefined ? { minOilStrength: criteria.minOilStrength } : {}),
      ...(criteria.maxOilStrength !== undefined ? { maxOilStrength: criteria.maxOilStrength } : {}),
      ...(criteria.searchTerm ? { searchTerm: criteria.searchTerm } : {}),
      ...(criteria.sortBy ? { sortBy: criteria.sortBy } : {}),
      ...(criteria.sortDirection ? { sortDirection: criteria.sortDirection } : {}),
    };
  }

  async getAllPlants(token: string, criteria?: PlantSearchCriteriaDTO): Promise<PlantDTO[]> {
    const response = await this.httpClient.get<PlantDTO[]>(`${this.basePath}/plants`, {
      headers: this.getAuthHeaders(token),
      params: this.buildQueryParams(criteria),
    });
    return this.unwrapResponse<PlantDTO[]>(response);
  }

  async searchPlants(criteria: PlantSearchCriteriaDTO, token: string): Promise<PlantDTO[]> {
    const response = await this.httpClient.get<PlantDTO[]>(`${this.basePath}/plants/search`, {
      headers: this.getAuthHeaders(token),
      params: this.buildQueryParams(criteria),
    });
    return this.unwrapResponse<PlantDTO[]>(response);
  }

  async getPlantById(id: number, token: string): Promise<PlantDTO> {
    const response = await this.httpClient.get<PlantDTO>(`${this.basePath}/plants/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<PlantDTO>(response);
  }

  async createPlant(plant: PlantDTO, token: string): Promise<PlantDTO> {
    const response = await this.httpClient.post<PlantDTO>(`${this.basePath}/plants`, plant, {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<PlantDTO>(response);
  }

  async updatePlant(id: number, plant: PlantDTO, token: string): Promise<PlantDTO> {
    const response = await this.httpClient.put<PlantDTO>(`${this.basePath}/plants/${id}`, plant, {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<PlantDTO>(response);
  }

  async deletePlant(id: number, token: string): Promise<void> {
    await this.httpClient.delete(`${this.basePath}/plants/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async harvestPlants(data: HarvestPlantsDTO, token: string): Promise<PlantDTO[]> {
    const response = await this.httpClient.post<PlantDTO[]>(
      `${this.basePath}/harvest`, // harvesting is a production operation
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return this.unwrapResponse<PlantDTO[]>(response);
  }

  async changeOilStrength(data: ChangeOilStrengthDTO, token: string): Promise<PlantDTO> {
    const response = await this.httpClient.put<PlantDTO>(
      `${this.basePath}/oil-strength`,
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return this.unwrapResponse<PlantDTO>(response);
  }
}
