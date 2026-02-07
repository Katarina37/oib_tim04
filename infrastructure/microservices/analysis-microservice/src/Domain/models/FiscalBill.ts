export class FiscalBill {
  id!: number;

  billNumber?: string;

  saleType!: "retail" | "wholesale";

  paymentMethod!: "cash" | "bank_transfer" | "card";

  soldItems!: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;

  totalAmount!: number;

  createdAt!: Date;

  userId?: number;
}
