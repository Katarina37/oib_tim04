import { AxiosInstance } from "axios";
import {
  IProductionClient,
  ProductionPlantDTO,
} from "../../Domain/services/IProductionClient";
import { PlantState } from "../../Domain/enums/PlantState";

type ApiSuccessPayload<T> = {
  success?: boolean;
  data?: T;
};

export class AxiosProductionClient implements IProductionClient {
  constructor(private readonly httpClient: AxiosInstance) {}

  async getPlantsByState(state: PlantState): Promise<ProductionPlantDTO[]> {
    const response = await this.httpClient.get<ProductionPlantDTO[]>(`/plants/state/${state}`, {
      params: {
        sortBy: "createdAt",
        sortDirection: "ASC",
      },
    });

    return Array.isArray(response.data) ? response.data : [];
  }

  async getPlantedPlantsByCommonName(commonName: string): Promise<ProductionPlantDTO[]> {
    const response = await this.httpClient.get<ProductionPlantDTO[]>("/plants/search", {
      params: {
        commonName,
        state: PlantState.PLANTED,
        sortBy: "createdAt",
        sortDirection: "ASC",
      },
    });

    return Array.isArray(response.data) ? response.data : [];
  }

  async plant(data: {
    commonName: string;
    latinName: string;
    countryOfOrigin: string;
    oilStrength: number;
  }): Promise<ProductionPlantDTO> {
    const response = await this.httpClient.post<ApiSuccessPayload<ProductionPlantDTO>>(
      "/production/plant",
      data
    );

    if (!response.data?.data) {
      throw new Error("Proizvodnja nije vratila podatke o zasadjenoj biljci.");
    }

    return response.data.data;
  }

  async changeOilStrength(plantId: number, percentageChange: number): Promise<ProductionPlantDTO> {
    const response = await this.httpClient.put<ApiSuccessPayload<ProductionPlantDTO>>(
      "/production/oil-strength",
      {
        plantId,
        percentageChange,
      }
    );

    if (!response.data?.data) {
      throw new Error("Proizvodnja nije vratila podatke nakon korekcije jacine ulja.");
    }

    return response.data.data;
  }

  async harvestPlants(commonName: string, quantity: number): Promise<ProductionPlantDTO[]> {
    const response = await this.httpClient.post<ApiSuccessPayload<ProductionPlantDTO[]>>(
      "/production/harvest",
      {
        commonName,
        quantity,
      }
    );

    if (!Array.isArray(response.data?.data)) {
      throw new Error("Proizvodnja nije vratila listu ubranih biljaka.");
    }

    return response.data.data;
  }

  async markPlantsProcessed(plantIds: number[]): Promise<void> {
    for (const plantId of plantIds) {
      await this.httpClient.put<ApiSuccessPayload<ProductionPlantDTO>>(`/plants/${plantId}`, {
        state: PlantState.PROCESSED,
      });
    }
  }
}
