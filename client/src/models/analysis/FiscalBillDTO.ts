export interface FiscalBillDTO{
    id: string;
    saleType: "retail" | "wholesale";
    paymentMethod: "cash" | "bank_transfer" | "card";
    soldItems: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    createdAt: string;
    userId?: number;
}