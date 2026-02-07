import { PaymentMethod } from "../../enums/PaymentMethod";
import { SaleType } from "../../enums/SaleType";

export interface CreateSaleItemDTO {
    perfumeId: number;
    quantity: number;
}

export interface CreateSaleDTO {
    userId: number;
    type: SaleType;
    paymentMethod: PaymentMethod;
    items: CreateSaleItemDTO[];
}
