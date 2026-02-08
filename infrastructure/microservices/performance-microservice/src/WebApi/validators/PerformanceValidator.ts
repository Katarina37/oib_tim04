import { RunSimulationDTO } from "../../Domain/DTOs/RunSimulationDTO";
import { AlgorithmType } from "../../Domain/enums/AlgorithmType";

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationFailure {
  success: false;
  message: string;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 200;
const MIN_REQUEST_COUNT = 1;
const MAX_REQUEST_COUNT = 5000;

const allowedAlgorithms = new Set<string>([
  AlgorithmType.DISTRIBUTION_CENTER,
  AlgorithmType.WAREHOUSE_CENTER,
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function validateRunSimulationPayload(payload: unknown): ValidationResult<RunSimulationDTO> {
  if (!isRecord(payload)) {
    return { success: false, message: "Podaci za simulaciju su obavezni." };
  }

  const naziv = typeof payload.naziv === "string" ? payload.naziv.trim() : "";
  if (naziv.length < MIN_NAME_LENGTH || naziv.length > MAX_NAME_LENGTH) {
    return {
      success: false,
      message: `Naziv mora imati izmedju ${MIN_NAME_LENGTH} i ${MAX_NAME_LENGTH} karaktera.`,
    };
  }

  const tipAlgoritma =
    typeof payload.tip_algoritma === "string" ? payload.tip_algoritma : "";
  if (!allowedAlgorithms.has(tipAlgoritma)) {
    return {
      success: false,
      message:
        "Tip algoritma mora biti distributivni_centar ili magacinski_centar.",
    };
  }

  const brojZahtevaRaw = payload.broj_zahteva;
  if (brojZahtevaRaw === undefined || brojZahtevaRaw === null) {
    return {
      success: true,
      data: {
        naziv,
        tip_algoritma: tipAlgoritma as AlgorithmType,
      },
    };
  }

  if (
    typeof brojZahtevaRaw !== "number" ||
    !Number.isInteger(brojZahtevaRaw) ||
    brojZahtevaRaw < MIN_REQUEST_COUNT ||
    brojZahtevaRaw > MAX_REQUEST_COUNT
  ) {
    return {
      success: false,
      message: `broj_zahteva mora biti ceo broj u opsegu ${MIN_REQUEST_COUNT}-${MAX_REQUEST_COUNT}.`,
    };
  }

  return {
    success: true,
    data: {
      naziv,
      tip_algoritma: tipAlgoritma as AlgorithmType,
      broj_zahteva: brojZahtevaRaw,
    },
  };
}

export function validateIdParam(rawId: string | undefined): ValidationResult<number> {
  if (!rawId) {
    return { success: false, message: "ID parametar je obavezan." };
  }

  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return { success: false, message: "ID mora biti pozitivan ceo broj." };
  }

  return { success: true, data: id };
}

