import { PaymentMethod } from "../enums/PaymentMethod";
import { SaleType } from "../enums/SaleType";
import { SaleItem } from "./SaleItem";

export class Sale {
    id!: number;
    billNumber!: string;
    salesType!: SaleType;
    paymentMethod!: PaymentMethod;
    totalAmount!: number;
    createdAt!: Date;
    items!: SaleItem[];
}
