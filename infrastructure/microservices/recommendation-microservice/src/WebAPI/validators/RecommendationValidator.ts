export interface ValidationResult {
  success: boolean;
  message?: string;
}

export function validateUserId(raw: string): ValidationResult {
  const parsed = Number.parseInt(raw, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return {
      success: false,
      message: "userId mora biti pozitivan cijeli broj."
    };
  }

  return { success: true };
}


export function validateRecommendationQuery(query: {
  limit?: unknown;
  refresh?: unknown;
}): ValidationResult {
  if (query.limit !== undefined) {
    const limit = Number.parseInt(String(query.limit), 10);

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      return {
        success: false,
        message: "limit mora biti cijeli broj između 1 i 100."
      };
    }
  }

  if (query.refresh !== undefined) {
    const refresh = String(query.refresh).toLowerCase();
    if (refresh !== "true" && refresh !== "false") {
      return {
        success: false,
        message: "refresh mora biti 'true' ili 'false'."
      };
    }
  }

  return { success: true };
}

export interface CoOccurrenceUpdatePayload {
  parfemId1?: unknown;
  parfemId2?: unknown;
}

export function validateCoOccurrenceUpdate(
  data: CoOccurrenceUpdatePayload
): ValidationResult {
  if (!data || typeof data !== "object") {
    return { success: false, message: "Tijelo zahtjeva je obavezno." };
  }

  const id1 = Number(data.parfemId1);
  const id2 = Number(data.parfemId2);

  if (!Number.isInteger(id1) || id1 <= 0) {
    return { success: false, message: "parfemId1 mora biti pozitivan cijeli broj." };
  }

  if (!Number.isInteger(id2) || id2 <= 0) {
    return { success: false, message: "parfemId2 mora biti pozitivan cijeli broj." };
  }

  if (id1 === id2) {
    return { success: false, message: "parfemId1 i parfemId2 moraju biti različiti." };
  }

  return { success: true };
}