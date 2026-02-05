import { PaymentMethod } from "../../enums/PaymentMethod";
import { SaleType } from "../../enums/SaleType";
import { SaleItemDTO } from "./SaleItemDTO";

export interface CreateSaleDTO {
    userId: number;
    type: SaleType;
    paymentMethod: PaymentMethod;
    items: SaleItemDTO[];
}