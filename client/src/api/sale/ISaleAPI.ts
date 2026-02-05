import { CreateSaleDTO } from "../../models/sales/CreateSaleDTO";
import { SaleResponseDTO } from "../../models/sales/SaleResponseDTO";
import { PerfumeDTO } from "../../models/sales/PerfumeDTO";

export interface ISaleAPI {
    executeSale(data: CreateSaleDTO, token: string): Promise<SaleResponseDTO>;
    getSaleById(id: number, token: string): Promise<SaleResponseDTO>;
    getAllSales(token: string): Promise<SaleResponseDTO[]>;
    getSaleByBillNumber(billNumber: string, token: string): Promise<SaleResponseDTO>;
    deleteSale(id: number, token: string): Promise<void>;
    getAvailablePerfumes(token: string): Promise<PerfumeDTO[]>;
}