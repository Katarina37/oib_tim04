import { PaymentMethod } from "../enums/PaymentMethod";
import { SaleType } from "../enums/SaleType";

export interface SaleResponseDTO {
    id: number;
    billNumber: string;
    type: SaleType;
    paymentMethod: PaymentMethod;
    totalAmount: number;
    createdAt: Date;
    items: {
        perfumeName: string;
        quantity: number;
        totalPrice: number;
    } [];
}