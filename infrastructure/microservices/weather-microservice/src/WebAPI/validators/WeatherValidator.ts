import { CreateWeatherDTO } from "../../Domain/DTOs/CreateWeatherDTO";

interface ValidationResult {
  success: boolean;
  message?: string;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const validateCreateWeatherData = (data: CreateWeatherDTO): ValidationResult => {
  if (!data.date) {
    return { success: false, message: "Datum je obavezan" };
  }

  if (!DATE_REGEX.test(data.date)) {
    return { success: false, message: "Datum mora biti u formatu YYYY-MM-DD" };
  }

  // Validate date is a real date
  const dateObj = new Date(data.date);
  if (isNaN(dateObj.getTime())) {
    return { success: false, message: "Neispravan datum" };
  }

  if (data.temperatureC === undefined || data.temperatureC === null) {
    return { success: false, message: "Temperatura je obavezna" };
  }

  if (typeof data.temperatureC !== "number") {
    return { success: false, message: "Temperatura mora biti broj" };
  }

  if (data.temperatureC < -50 || data.temperatureC > 60) {
    return { success: false, message: "Temperatura mora biti između -50 i 60°C" };
  }

  if (data.humidityPct === undefined || data.humidityPct === null) {
    return { success: false, message: "Vlažnost je obavezna" };
  }

  if (typeof data.humidityPct !== "number" || !Number.isInteger(data.humidityPct)) {
    return { success: false, message: "Vlažnost mora biti ceo broj" };
  }

  if (data.humidityPct < 0 || data.humidityPct > 100) {
    return { success: false, message: "Vlažnost mora biti između 0 i 100%" };
  }

  if (data.precipitationMm === undefined || data.precipitationMm === null) {
    return { success: false, message: "Padavine su obavezne" };
  }

  if (typeof data.precipitationMm !== "number") {
    return { success: false, message: "Padavine moraju biti broj" };
  }

  if (data.precipitationMm < 0 || data.precipitationMm > 500) {
    return { success: false, message: "Padavine moraju biti između 0 i 500mm" };
  }

  if (data.note && data.note.length > 500) {
    return { success: false, message: "Napomena može imati maksimalno 500 karaktera" };
  }

  return { success: true };
};

export const validateDateParam = (date: string): ValidationResult => {
  if (!date) {
    return { success: false, message: "Datum je obavezan" };
  }

  if (!DATE_REGEX.test(date)) {
    return { success: false, message: "Datum mora biti u formatu YYYY-MM-DD" };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { success: false, message: "Neispravan datum" };
  }

  return { success: true };
};

export const validateMonthParam = (yearMonth: string): ValidationResult => {
  if (!yearMonth) {
    return { success: false, message: "Mesec je obavezan" };
  }

  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(yearMonth)) {
    return { success: false, message: "Mesec mora biti u formatu YYYY-MM" };
  }

  return { success: true };
};
