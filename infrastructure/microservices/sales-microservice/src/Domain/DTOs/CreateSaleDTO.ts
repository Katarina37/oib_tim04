import { PaymentMethod } from "../enums/PaymentMethod";
import { SaleType } from "../enums/SaleType";

export interface CreateSaleDto {
    userId: number;
    type: SaleType;
    paymentMethod: PaymentMethod;
    items: {
        perfumeId: number;
        quantity: number;
        price: number;
        name: string;
    } [];
}