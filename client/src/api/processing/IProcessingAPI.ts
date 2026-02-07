import {
  PerfumeBatchDTO,
  PerfumeDTO,
  PerfumeSearchCriteriaDTO,
  ProcessingStatsDTO,
  ProcessingSummaryDTO,
  RequestPerfumesDTO,
  StartProcessingDTO,
} from "../../models/processing/ProcessingDTO";

export interface IProcessingAPI {
  startProcessing(data: StartProcessingDTO, token: string): Promise<ProcessingSummaryDTO>;
  requestPerfumes(data: RequestPerfumesDTO, token: string): Promise<PerfumeBatchDTO>;
  getPerfumes(token: string, criteria?: PerfumeSearchCriteriaDTO): Promise<PerfumeDTO[]>;
  getStats(token: string): Promise<ProcessingStatsDTO>;
}
