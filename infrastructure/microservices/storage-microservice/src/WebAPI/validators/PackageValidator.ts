import { SendPackageDTO } from "../../Domain/DTOs/SendPackageDTO";
import { PackagingSyncDTO } from "../../Domain/DTOs/PackagingSyncDTO";

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

export function validatePackageIds(packageIds: unknown): ValidationResult {
    if (!Array.isArray(packageIds) || packageIds.length === 0) {
        return { success: false, message: "Lista ID ambalaza je obavezna" };
    }

    const hasInvalidId = packageIds.some(
        (id) => !Number.isInteger(id) || Number(id) <= 0
    );

    if (hasInvalidId) {
        return { success: false, message: "Svi ID-jevi ambalaza moraju biti pozitivni celi brojevi" };
    }

    return { success: true };
}

export function validatePerfumeIds(perfumeIds: unknown): ValidationResult {
    if (!Array.isArray(perfumeIds) || perfumeIds.length === 0) {
        return { success: false, message: "Lista ID parfema je obavezna" };
    }

    const hasInvalidId = perfumeIds.some(
        (id) => !Number.isInteger(id) || Number(id) <= 0
    );

    if (hasInvalidId) {
        return { success: false, message: "Svi ID-jevi parfema moraju biti pozitivni celi brojevi" };
    }

    return { success: true };
}

export function validatePackagingSyncData(data: PackagingSyncDTO): ValidationResult {
    const idsValidation = validatePackageIds(data.packageIds);
    if (!idsValidation.success) {
        return idsValidation;
    }

    if (data.operation !== "created" && data.operation !== "moved") {
        return { success: false, message: "Operacija sinhronizacije mora biti created ili moved." };
    }

    if (
        data.targetWarehouseId !== undefined &&
        (!Number.isInteger(data.targetWarehouseId) || data.targetWarehouseId <= 0)
    ) {
        return { success: false, message: "ID ciljnog skladista mora biti pozitivan ceo broj." };
    }

    return { success: true };
}
