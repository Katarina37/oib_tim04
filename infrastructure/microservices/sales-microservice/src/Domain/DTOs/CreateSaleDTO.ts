import { PaymentMethod } from "../enums/PaymentMethod";
import { SaleType } from "../enums/SaleType";

export interface CreateSaleItemDto {
    perfumeId: number;
    quantity: number;
}

export interface CreateSaleDto {
    userId: number;
    type: SaleType;
    paymentMethod: PaymentMethod;
    items: CreateSaleItemDto[];
}
