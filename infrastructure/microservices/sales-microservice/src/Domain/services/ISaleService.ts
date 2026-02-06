import { CreateSaleDto } from "../DTOs/CreateSaleDTO";
import { SaleResponseDTO } from "../DTOs/SaleResponseDTO";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { UserContext } from "../types/UserContext";

export interface ISaleService {
    executeSale(data: CreateSaleDto, userContext: UserContext): Promise<SaleResponseDTO>;
    getSaleById(id: number): Promise<SaleResponseDTO>;
    getAllSales(): Promise<SaleResponseDTO[]>;
    getSaleByBillNumber(billNumber: string): Promise<SaleResponseDTO>;
    deleteSale(id: number): Promise<void>;
    getAvailablePerfumes(userContext?: UserContext): Promise<PerfumeDTO[]>;
}
