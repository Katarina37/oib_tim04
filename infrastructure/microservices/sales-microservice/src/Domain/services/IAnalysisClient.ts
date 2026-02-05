import { CreateFiscalBillDTO } from "Domain/DTOs/CreateFiscallBillDTO";

export interface IAnalysisClient {
  createFiscalBill(data: CreateFiscalBillDTO): Promise<{ billId: number }>;
}
