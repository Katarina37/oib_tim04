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

   for (const item of data.soldItems) {
    if (!item.productId || !item.productName) {
      return { success: false, message: "Proizvod mora imati ID i naziv" };
    }
    if (item.quantity <= 0) {
     return { success: false, message: "Kolicina mora biti veća od 0" };
   }
    if (item.price <= 0) {
     return { success: false, message: "Cena mora biti veća od 0" };
   }
  }
    return { success: true };
}

