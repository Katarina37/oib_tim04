import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { UserContext } from "../types/UserContext";

export interface IPerfumeCatalogClient {
  getAvailablePerfumes(userContext?: UserContext): Promise<PerfumeDTO[]>;
}
