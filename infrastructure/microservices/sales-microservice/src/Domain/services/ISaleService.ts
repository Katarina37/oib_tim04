import { CreateSaleDto } from "../DTOs/CreateSaleDTO";
import { SaleResponseDTO } from "../DTOs/SaleResponseDTO";

export interface ISaleService {
    executeSale(data: CreateSaleDto): Promise<SaleResponseDTO>;
    getSaleById(id: number): Promise<SaleResponseDTO>;
    getAllSales(): Promise<SaleResponseDTO[]>;
    getSaleByBillNumber(billNumber: string): Promise<SaleResponseDTO>;
    deleteSale(id: number): Promise<void>;
}