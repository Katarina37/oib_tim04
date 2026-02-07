export interface SaleItemDTO {
    perfumeId: number;
    quantity: number;
    price: number;
    name: string;
}

export interface CartSaleItemDTO extends SaleItemDTO {
    name: string;
    price: number;
}
