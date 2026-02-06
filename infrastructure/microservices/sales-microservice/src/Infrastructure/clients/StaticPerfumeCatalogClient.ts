import { PerfumeDTO } from "../../Domain/DTOs/PerfumeDTO";
import { PerfumeType } from "../../Domain/enums/PerfumeType";
import { IPerfumeCatalogClient } from "../../Domain/services/IPerfumeCatalogClient";
import { UserContext } from "../../Domain/types/UserContext";

export class StaticPerfumeCatalogClient implements IPerfumeCatalogClient {
  async getAvailablePerfumes(_userContext?: UserContext): Promise<PerfumeDTO[]> {
    return [
      {
        id: 1,
        name: "Rosa Mistika",
        type: PerfumeType.PERFUME,
        volumeMl: 150,
        price: 12500,
        stock: 45,
        serialNumber: "PP-2026-1",
        plantId: 1,
        expiryDate: "2027-12-31",
      },
      {
        id: 2,
        name: "Lavander Noir",
        type: PerfumeType.COLOGNE_WATER,
        volumeMl: 250,
        price: 8900,
        stock: 67,
        serialNumber: "PP-2026-2",
        plantId: 2,
        expiryDate: "2027-12-31",
      },
      {
        id: 3,
        name: "Bergamot Esenc",
        type: PerfumeType.COLOGNE_WATER,
        volumeMl: 150,
        price: 13200,
        stock: 23,
        serialNumber: "PP-2026-3",
        plantId: 3,
        expiryDate: "2027-12-31",
      },
      {
        id: 4,
        name: "Jasmin De Nuit",
        type: PerfumeType.PERFUME,
        volumeMl: 250,
        price: 9500,
        stock: 38,
        serialNumber: "PP-2026-4",
        plantId: 4,
        expiryDate: "2027-12-31",
      },
    ];
  }
}
