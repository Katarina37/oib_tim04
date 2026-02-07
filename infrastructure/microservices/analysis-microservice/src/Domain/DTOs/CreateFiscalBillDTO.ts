export interface CreateFiscalBillDTO {
    saleType: "maloprodaja" | "veleprodaja";
    paymentMethod: "gotovina" | "uplata_na_racun" | "karticno";
    soldItems: Array<{
        productId: number;
        productName: string;
        quantity: number;
        price: number;
    }>;
    userId?: number;
}
