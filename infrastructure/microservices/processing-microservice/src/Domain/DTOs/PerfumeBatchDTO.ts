import { PerfumeDTO } from "./PerfumeDTO";

export interface PerfumeBatchDTO {
  requestedQuantity: number;
  returnedQuantity: number;
  perfumes: PerfumeDTO[];
}
