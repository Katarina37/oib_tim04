import axios, { AxiosInstance, AxiosResponse } from "axios";
import { PlantDTO } from "../../models/plants/PlantDTO";
import { IPlantAPI } from "./IPlantAPI";

export class PlantAPI implements IPlantAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    const baseURL =
      import.meta.env.VITE_PRODUCTION_SERVICE_URL || import.meta.env.VITE_GATEWAY_URL;

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

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

  async getAllPlants(token: string): Promise<PlantDTO[]> {
    const response: AxiosResponse<PlantDTO[]> = await this.axiosInstance.get("/plants", {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<PlantDTO[]>(response.data);
  }

  async getPlantById(id: number, token: string): Promise<PlantDTO> {
    const response: AxiosResponse<PlantDTO> = await this.axiosInstance.get(`/plants/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<PlantDTO>(response.data);
  }

  async createPlant(plant: PlantDTO, token: string): Promise<PlantDTO> {
    const response: AxiosResponse<PlantDTO> = await this.axiosInstance.post("/plants", plant, {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<PlantDTO>(response.data);
  }

  async updatePlant(id: number, plant: PlantDTO, token: string): Promise<PlantDTO> {
    const response: AxiosResponse<PlantDTO> = await this.axiosInstance.put(`/plants/${id}`, plant, {
      headers: this.getAuthHeaders(token),
    });
    return this.unwrapResponse<PlantDTO>(response.data);
  }

  async deletePlant(id: number, token: string): Promise<void> {
    await this.axiosInstance.delete(`/plants/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }
}
