export interface FiscalBillDTO{
    id: number;
    saleType: "retail" | "wholesale";
    paymentMethod: "cash" | "bank_transfer" | "card";
    soldItems: Array<{
        productId: number;
        productName: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    createdAt: string;
    userId?: number;
}
