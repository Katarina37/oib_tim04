import { CreateFiscalBillDTO } from "../../Domain/DTOs/CreateFiscalBillDTO";
import { SalesAnalysisDTO } from "../../Domain/DTOs/SalesAnalysisDTO";
import { TopProductsDTO } from "../../Domain/DTOs/TopProductsDTO";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

export function validateFiscalBill(data: CreateFiscalBillDTO): ValidationResult {
  if (!data.saleType || !["retail", "wholesale"].includes(data.saleType)) {
    return { success: false, message: "Tip prodaje mora biti 'retail' ili 'wholesale'" };
  }
  
  if (!data.paymentMethod || !["cash", "bank_transfer", "card"].includes(data.paymentMethod)) {
    return { success: false, message: "Način plaćanja mora biti 'cash', 'bank_transfer' ili 'card'" };
  }
  
  if (!data.soldItems || data.soldItems.length === 0) {
    return { success: false, message: "Lista prodanih proizvoda ne sme biti prazna" };
  }

  // ******
    return { success: true };
}