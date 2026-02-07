import {
  PerfumeDTO,
  PerfumeSearchCriteriaDTO,
  ProcessingStatsDTO,
  ProcessingSummaryDTO,
  StartProcessingDTO,
} from "../../models/processing/ProcessingDTO";

export interface IProcessingAPI {
  startProcessing(data: StartProcessingDTO, token: string): Promise<ProcessingSummaryDTO>;
  getPerfumes(token: string, criteria?: PerfumeSearchCriteriaDTO): Promise<PerfumeDTO[]>;
  getStats(token: string): Promise<ProcessingStatsDTO>;
}
