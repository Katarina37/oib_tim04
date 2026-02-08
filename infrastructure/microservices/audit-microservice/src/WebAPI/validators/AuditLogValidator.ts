import { isIP } from "node:net";
import { AuditLogSearchCriteriaDTO } from "../../Domain/DTOs/AuditLogSearchCriteriaDTO";
import { CreateAuditLogDTO } from "../../Domain/DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../../Domain/DTOs/UpdateAuditLogDTO";
import { ValidationError } from "../../Domain/errors/ValidationError";
import { LogLevel } from "../../Domain/enums/LogLevel";

const MAX_DESCRIPTION_LENGTH = 10_000;
const MAX_MICROSERVICE_LENGTH = 100;
const MAX_IP_LENGTH = 45;

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const parseRequiredString = (
  value: unknown,
  fieldName: string,
  maxLength = Number.MAX_SAFE_INTEGER
): string => {
  if (typeof value !== "string") {
    throw new ValidationError(`Field '${fieldName}' must be a string.`);
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError(`Field '${fieldName}' cannot be empty.`);
  }
  if (normalized.length > maxLength) {
    throw new ValidationError(
      `Field '${fieldName}' exceeds max allowed length (${maxLength}).`
    );
  }

  return normalized;
};

const parseOptionalNullableString = (
  value: unknown,
  fieldName: string,
  maxLength: number
): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`Field '${fieldName}' must be a string or null.`);
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError(`Field '${fieldName}' cannot be empty when provided.`);
  }
  if (normalized.length > maxLength) {
    throw new ValidationError(
      `Field '${fieldName}' exceeds max allowed length (${maxLength}).`
    );
  }

  return normalized;
};

const parseOptionalNullableUserId = (value: unknown): number | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const normalizedValue =
    typeof value === "string" ? Number.parseInt(value.trim(), 10) : value;

  if (typeof normalizedValue !== "number" || !Number.isInteger(normalizedValue)) {
    throw new ValidationError("Field 'korisnik_id' must be a positive integer or null.");
  }

  if (normalizedValue <= 0) {
    throw new ValidationError("Field 'korisnik_id' must be a positive integer.");
  }

  return normalizedValue;
};

const parseOptionalNullableJson = (
  value: unknown
): Record<string, unknown> | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (!isObject(value)) {
    throw new ValidationError("Field 'dodatni_podaci' must be a JSON object or null.");
  }

  return value;
};

const parseOptionalNullableIpAddress = (
  value: unknown,
  fieldName: string
): string | null | undefined => {
  const parsed = parseOptionalNullableString(value, fieldName, MAX_IP_LENGTH);
  if (parsed === undefined || parsed === null) {
    return parsed;
  }

  if (parsed.toLowerCase() === "unknown") {
    return parsed;
  }

  if (isIP(parsed) === 0) {
    throw new ValidationError(`Field '${fieldName}' must be a valid IPv4/IPv6 address.`);
  }

  return parsed;
};

const parseRequiredLogLevel = (value: unknown): LogLevel => {
  if (typeof value !== "string") {
    throw new ValidationError("Field 'tip_zapisa' must be a string.");
  }

  const normalized = value.toUpperCase();
  if (!Object.values(LogLevel).includes(normalized as LogLevel)) {
    throw new ValidationError("Field 'tip_zapisa' must be one of INFO, WARNING, ERROR.");
  }

  return normalized as LogLevel;
};

const parseOptionalLogLevel = (value: unknown): LogLevel | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return parseRequiredLogLevel(value);
};

const parseDateValue = (value: unknown, fieldName: string): Date | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) {
    throw new ValidationError(`Field '${fieldName}' must be a valid date value.`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`Field '${fieldName}' must be a valid date.`);
  }

  return parsed;
};

export const parseAuditLogId = (value: unknown): number => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError("Audit log ID must be a positive integer.");
  }
  return parsed;
};

export const parseCreateAuditLogData = (payload: unknown): CreateAuditLogDTO => {
  if (!isObject(payload)) {
    throw new ValidationError("Request body must be a valid JSON object.");
  }

  return {
    tip_zapisa: parseRequiredLogLevel(payload.tip_zapisa),
    opis: parseRequiredString(payload.opis, "opis", MAX_DESCRIPTION_LENGTH),
    mikroservis: parseOptionalNullableString(
      payload.mikroservis,
      "mikroservis",
      MAX_MICROSERVICE_LENGTH
    ),
    korisnik_id: parseOptionalNullableUserId(payload.korisnik_id),
    ip_adresa: parseOptionalNullableIpAddress(payload.ip_adresa, "ip_adresa"),
    dodatni_podaci: parseOptionalNullableJson(payload.dodatni_podaci),
  };
};

export const parseUpdateAuditLogData = (payload: unknown): UpdateAuditLogDTO => {
  if (!isObject(payload)) {
    throw new ValidationError("Request body must be a valid JSON object.");
  }

  const result: UpdateAuditLogDTO = {
    tip_zapisa: parseOptionalLogLevel(payload.tip_zapisa),
    mikroservis: parseOptionalNullableString(
      payload.mikroservis,
      "mikroservis",
      MAX_MICROSERVICE_LENGTH
    ),
    korisnik_id: parseOptionalNullableUserId(payload.korisnik_id),
    ip_adresa: parseOptionalNullableIpAddress(payload.ip_adresa, "ip_adresa"),
    dodatni_podaci: parseOptionalNullableJson(payload.dodatni_podaci),
  };

  if (payload.opis !== undefined) {
    result.opis = parseRequiredString(payload.opis, "opis", MAX_DESCRIPTION_LENGTH);
  }

  const hasAtLeastOneField = Object.values(result).some((value) => value !== undefined);
  if (!hasAtLeastOneField) {
    throw new ValidationError("At least one field must be provided for update.");
  }

  return result;
};

const parseOptionalQueryString = (value: unknown, fieldName: string): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    throw new ValidationError(`Query param '${fieldName}' must appear only once.`);
  }

  if (typeof value !== "string") {
    throw new ValidationError(`Query param '${fieldName}' must be a string.`);
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

export const parseAuditSearchCriteria = (query: unknown): AuditLogSearchCriteriaDTO => {
  if (!isObject(query)) {
    throw new ValidationError("Query parameters are invalid.");
  }

  const tip_zapisa = parseOptionalQueryString(query.tip_zapisa, "tip_zapisa");
  const opis = parseOptionalQueryString(query.opis, "opis");
  const mikroservis = parseOptionalQueryString(query.mikroservis, "mikroservis");
  const ip_adresa = parseOptionalQueryString(query.ip_adresa, "ip_adresa");

  const korisnikIdRaw = parseOptionalQueryString(query.korisnik_id, "korisnik_id");
  const datumOdRaw = parseOptionalQueryString(query.datum_od, "datum_od");
  const datumDoRaw = parseOptionalQueryString(query.datum_do, "datum_do");

  const datum_od = datumOdRaw ? parseDateValue(datumOdRaw, "datum_od") : undefined;
  const datum_do = datumDoRaw ? parseDateValue(datumDoRaw, "datum_do") : undefined;

  if (datum_od && datum_do && datum_od.getTime() > datum_do.getTime()) {
    throw new ValidationError("Query param 'datum_od' cannot be greater than 'datum_do'.");
  }

  let korisnik_id: number | undefined;
  if (korisnikIdRaw !== undefined) {
    const parsedUserId = Number.parseInt(korisnikIdRaw, 10);
    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      throw new ValidationError("Query param 'korisnik_id' must be a positive integer.");
    }
    korisnik_id = parsedUserId;
  }

  if (mikroservis && mikroservis.length > MAX_MICROSERVICE_LENGTH) {
    throw new ValidationError(
      `Query param 'mikroservis' exceeds max allowed length (${MAX_MICROSERVICE_LENGTH}).`
    );
  }

  if (ip_adresa) {
    if (ip_adresa.length > MAX_IP_LENGTH) {
      throw new ValidationError(
        `Query param 'ip_adresa' exceeds max allowed length (${MAX_IP_LENGTH}).`
      );
    }
  }

  if (opis && opis.length > MAX_DESCRIPTION_LENGTH) {
    throw new ValidationError(
      `Query param 'opis' exceeds max allowed length (${MAX_DESCRIPTION_LENGTH}).`
    );
  }

  return {
    tip_zapisa: tip_zapisa ? parseRequiredLogLevel(tip_zapisa) : undefined,
    opis,
    mikroservis,
    korisnik_id,
    ip_adresa,
    datum_od,
    datum_do,
  };
};
