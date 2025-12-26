export interface CreateFiscalBillDTO {
    saleType: "retail" | "wholesale";
    paymentMethod: "cash" | "bank_transfer" | "card";
    soldItems: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
    }>;
    userId?: number;
}