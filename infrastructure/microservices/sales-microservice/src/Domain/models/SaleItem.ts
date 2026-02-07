import { Sale } from "./Sale";

export class SaleItem {
    id!: number;
    perfumeId!: number;
    perfumeName!: string;
    quantity!: number;
    pricePerUnit!: number;
    totalPrice!: number;
    sale!: Sale;
}
