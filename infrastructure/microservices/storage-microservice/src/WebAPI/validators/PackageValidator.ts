import { SendPackageDTO } from "../../Domain/DTOs/SendPackageDTO";

export interface ValidationResult {
    success: boolean;
    message?: string;
}

export function validateSendPackageData(data: SendPackageDTO): ValidationResult {
    if (data.quantity === undefined || data.quantity === null) {
        return { success: false, message: "Kolicina pakovanja je obavezna" };
    }

    if (typeof data.quantity !== "number") {
        return { success: false, message: "Kolicina pakovanja mora biti broj" };
    }

    if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
        return { success: false, message: "Kolicina pakovanja mora biti pozitivan ceo broj" };
    }

    return { success: true };
}
