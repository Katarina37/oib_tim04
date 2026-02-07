import { CreateSaleDto } from "../../Domain/DTOs/CreateSaleDTO";
import { SaleType } from "../../Domain/enums/SaleType";
import { PaymentMethod } from "../../Domain/enums/PaymentMethod";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

export function validateCreateSale(data: CreateSaleDto): ValidationResult {
    if (!data) {
        return { success: false, message: "Sale data is required" };
    }
    
    if (!data.userId || data.userId <= 0) {
        return { success: false, message: "Invalid user ID" };
    }

    if (!data.type || !Object.values(SaleType).includes(data.type)) {
        return { success: false, message: "Invalid sale type" };
    }   

    if (!data.paymentMethod || !Object.values(PaymentMethod).includes(data.paymentMethod)) {
        return { success: false, message: "Invalid payment method" };
    }   

    if (!data.items || data.items.length === 0) {
        return { success: false, message: "Sale must contain at least one item" };
    }

    for (const item of data.items) {
        if (!item.perfumeId || item.perfumeId <= 0) {
            return { success: false, message: "Invalid perfume ID in items" };
        }
        if (!item.quantity || item.quantity <= 0) {
            return { success: false, message: "Item quantity must be greater than zero" };
        }
    }
    return { success: true };
}
