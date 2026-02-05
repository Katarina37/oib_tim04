import { PaymentMethod } from "../../enums/PaymentMethod";
import { SaleType } from "../../enums/SaleType";
import { SaleItemResponseDTO } from "./SaleItemResponseDTO";

export interface SaleResponseDTO {
    id: number;
    billNumber: string;
    type: SaleType;
    paymentMethod: PaymentMethod;
    totalAmount: number;
    createdAt: string;
    items: SaleItemResponseDTO[];
}
