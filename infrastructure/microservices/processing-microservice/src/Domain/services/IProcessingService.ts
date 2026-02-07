import { PerfumeBatchDTO } from "../DTOs/PerfumeBatchDTO";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { PerfumeSearchCriteriaDTO } from "../DTOs/PerfumeSearchCriteriaDTO";
import { ProcessingSummaryDTO } from "../DTOs/ProcessingSummaryDTO";
import { RequestPerfumesDTO } from "../DTOs/RequestPerfumesDTO";
import { StartProcessingDTO } from "../DTOs/StartProcessingDTO";

export interface IProcessingService {
  startProcessing(data: StartProcessingDTO): Promise<ProcessingSummaryDTO>;
  requestPerfumes(data: RequestPerfumesDTO): Promise<PerfumeBatchDTO>;
  getPerfumes(criteria?: PerfumeSearchCriteriaDTO): Promise<PerfumeDTO[]>;
  getStats(): Promise<{
    totalPerfumes: number;
    availableForPackaging: number;
    perfumeCount: number;
    cologneCount: number;
  }>;
}
