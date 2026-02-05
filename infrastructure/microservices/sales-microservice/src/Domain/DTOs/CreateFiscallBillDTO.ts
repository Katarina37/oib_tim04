import { PaymentMethod } from "Domain/enums/PaymentMethod";
import { SaleType } from "Domain/enums/SaleType";

export interface CreateFiscalBillDTO {
  saleType: SaleType;
  paymentMethod: PaymentMethod;
  soldItems: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
  userId: number;
}