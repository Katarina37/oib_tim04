import { AxiosInstance } from "axios";
import { IProductionClient, PlantData } from "../../Domain/services/IProductionClient";

export class AxiosProductionClient implements IProductionClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  async getPlantedPlants(): Promise<PlantData[]> {
    const response = await this.httpClient.get<PlantData[]>("/plants/state/posadjena");
    return response.data;
  }

  async updatePlantOilStrength(plantId: number, newStrength: number): Promise<void> {
    await this.httpClient.put(`/plants/${plantId}`, {
      oilStrength: newStrength,
    });
  }

  async deletePlant(plantId: number): Promise<void> {
    await this.httpClient.delete(`/plants/${plantId}`);
  }

  async duplicatePlant(plantId: number): Promise<PlantData> {
    // First get the plant data
    const response = await this.httpClient.get<PlantData>(`/plants/${plantId}`);
    const plant = response.data;
    
    // Create a duplicate
    const createResponse = await this.httpClient.post<{ data: PlantData }>("/plants", {
      commonName: plant.commonName,
      oilStrength: plant.oilStrength,
      latinName: (plant as unknown as { latinName: string }).latinName,
      countryOfOrigin: (plant as unknown as { countryOfOrigin: string }).countryOfOrigin,
    });
    
    return createResponse.data.data;
  }
}
