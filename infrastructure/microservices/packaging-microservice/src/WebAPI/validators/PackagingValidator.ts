import { PackagePerfumesDTO } from "../../Domain/DTOs/PackagePerfumesDTO";
import { SendToWarehouseDTO } from "../../Domain/DTOs/SendToWarehouseDTO";
import { BottleVolume } from "../../Domain/enums/BottleVolume";
import { PerfumeType } from "../../Domain/enums/PerfumeType";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

export function validateQuantityPayload(data: { quantity?: number }): ValidationResult {
  if (data.quantity === undefined || data.quantity === null) {
    return { success: false, message: "Kolicina je obavezna." };
  }

  if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
    return { success: false, message: "Kolicina mora biti pozitivan ceo broj." };
  }

  return { success: true };
}

export function validatePackagePerfumesData(data: PackagePerfumesDTO): ValidationResult {
  const quantityValidation = validateQuantityPayload(data);
  if (!quantityValidation.success) {
    return quantityValidation;
  }

  if (
    data.targetWarehouseId !== undefined &&
    (!Number.isInteger(data.targetWarehouseId) || data.targetWarehouseId <= 0)
  ) {
    return { success: false, message: "ID ciljnog skladista mora biti pozitivan ceo broj." };
  }

  if (data.perfumeType && !Object.values(PerfumeType).includes(data.perfumeType)) {
    return { success: false, message: "Neispravan tip parfema." };
  }

  if (
    data.bottleVolumeMl !== undefined &&
    !Object.values(BottleVolume).includes(data.bottleVolumeMl)
  ) {
    return { success: false, message: "Neto kolicina mora biti 150ml ili 250ml." };
  }

  if (data.packageName !== undefined && data.packageName.trim().length < 2) {
    return { success: false, message: "Naziv ambalaze mora imati najmanje 2 karaktera." };
  }

  if (data.senderAddress !== undefined && data.senderAddress.trim().length < 2) {
    return { success: false, message: "Adresa posiljaoca mora imati najmanje 2 karaktera." };
  }

  return { success: true };
}

export function validateSendToWarehouseData(data: SendToWarehouseDTO): ValidationResult {
  if (!Number.isInteger(data.targetWarehouseId) || data.targetWarehouseId <= 0) {
    return { success: false, message: "ID ciljnog skladista mora biti pozitivan ceo broj." };
  }

  if (data.packageIds === undefined) {
    return { success: true };
  }

  if (!Array.isArray(data.packageIds) || data.packageIds.length === 0) {
    return { success: false, message: "Ako su prosledjeni, ID-jevi paketa ne smeju biti prazni." };
  }

  const hasInvalidId = data.packageIds.some(
    (packageId) => !Number.isInteger(packageId) || packageId <= 0
  );
  if (hasInvalidId) {
    return { success: false, message: "Svi ID-jevi paketa moraju biti pozitivni celi brojevi." };
  }

  return { success: true };
}
