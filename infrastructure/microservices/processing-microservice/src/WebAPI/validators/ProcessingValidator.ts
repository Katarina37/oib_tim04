import { StartProcessingDTO } from "../../Domain/DTOs/StartProcessingDTO";
import { RequestPerfumesDTO } from "../../Domain/DTOs/RequestPerfumesDTO";
import { BottleVolume } from "../../Domain/enums/BottleVolume";
import { PerfumeType } from "../../Domain/enums/PerfumeType";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

export function validateStartProcessingData(data: StartProcessingDTO): ValidationResult {
  if (!data.perfumeName || data.perfumeName.trim().length < 2) {
    return { success: false, message: "Naziv parfema mora imati najmanje 2 karaktera." };
  }

  if (!Object.values(PerfumeType).includes(data.perfumeType)) {
    return { success: false, message: "Neispravan tip parfema." };
  }

  if (!Number.isInteger(data.bottleQuantity) || data.bottleQuantity <= 0) {
    return { success: false, message: "Kolicina bocica mora biti pozitivan ceo broj." };
  }

  if (!Object.values(BottleVolume).includes(data.bottleVolumeMl)) {
    return { success: false, message: "Neto kolicina mora biti 150ml ili 250ml." };
  }

  return { success: true };
}

export function validateRequestPerfumesData(data: RequestPerfumesDTO): ValidationResult {
  if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
    return { success: false, message: "Kolicina mora biti pozitivan ceo broj." };
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

  return { success: true };
}

export function parseBottleVolumeFromQuery(value: unknown): BottleVolume | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    return undefined;
  }

  if (parsed === BottleVolume.ML_150 || parsed === BottleVolume.ML_250) {
    return parsed as BottleVolume;
  }

  return undefined;
}
