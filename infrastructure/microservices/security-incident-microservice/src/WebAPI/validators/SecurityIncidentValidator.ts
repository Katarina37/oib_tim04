import { IncidentStatus } from "../../Domain/enums/IncidentStatus";

const validationError = (message: string): never => {
  throw new Error(`VALIDATION:${message}`);
};

export const parseIncidentId = (raw: unknown): number => {
  const value = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isInteger(value) || value <= 0) {
    validationError("Incident id must be a positive integer.");
  }

  return value;
};

export const parseIncidentStatus = (raw: unknown): IncidentStatus => {
  if (typeof raw !== "string") {
    validationError("Field 'status' must be a string.");
  }

  const normalized = (raw as string).toUpperCase();
  if (!Object.values(IncidentStatus).includes(normalized as IncidentStatus)) {
    validationError(
      "Field 'status' must be one of OPEN, IN_PROGRESS, RESOLVED, FALSE_POSITIVE."
    );
  }

  return normalized as IncidentStatus;
};

export const parseLookbackMinutes = (raw: unknown): number | undefined => {
  if (raw === undefined || raw === null || raw === "") {
    return undefined;
  }

  const value = Number.parseInt(String(raw), 10);
  if (!Number.isInteger(value) || value <= 0) {
    validationError("Field 'lookbackMinutes' must be a positive integer.");
  }

  if (value > 24 * 60) {
    validationError("Field 'lookbackMinutes' cannot exceed 1440 minutes.");
  }

  return value;
};
