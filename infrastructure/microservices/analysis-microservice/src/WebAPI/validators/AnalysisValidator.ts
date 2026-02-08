import { CreateFiscalBillDTO } from "../../Domain/DTOs/CreateFiscalBillDTO";
import { SalesAnalysisDTO } from "../../Domain/DTOs/SalesAnalysisDTO";
import { TopProductsDTO } from "../../Domain/DTOs/TopProductsDTO";
import { TrendAnalysisDTO } from "../../Domain/DTOs/TrendAnalysisDTO";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

const ALLOWED_SALE_TYPES: Array<CreateFiscalBillDTO["saleType"]> = ["retail", "wholesale"];
const ALLOWED_PAYMENT_METHODS: Array<CreateFiscalBillDTO["paymentMethod"]> = [
  "cash",
  "bank_transfer",
  "card",
];
const ALLOWED_PERIOD_TYPES: Array<SalesAnalysisDTO["periodType"]> = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "total",
];
const ALLOWED_TREND_TYPES: Array<TrendAnalysisDTO["analysisType"]> = [
  "monthly_trend",
  "product_trend",
  "category_trend",
];

export function validateFiscalBill(data: CreateFiscalBillDTO): ValidationResult {
  if (!data || typeof data !== "object") {
    return { success: false, message: "Telo zahteva je obavezno." };
  }

  if (!data.saleType || !ALLOWED_SALE_TYPES.includes(data.saleType)) {
    return { success: false, message: "Tip prodaje mora biti 'retail' ili 'wholesale'." };
  }

  if (!data.paymentMethod || !ALLOWED_PAYMENT_METHODS.includes(data.paymentMethod)) {
    return { success: false, message: "Nacin placanja mora biti 'cash', 'bank_transfer' ili 'card'." };
  }

  if (!Array.isArray(data.soldItems) || data.soldItems.length === 0) {
    return { success: false, message: "Lista prodatih proizvoda ne sme biti prazna." };
  }

  for (const item of data.soldItems) {
    if (!Number.isInteger(item.productId) || item.productId <= 0) {
      return { success: false, message: "Svaki proizvod mora imati validan productId." };
    }
    if (!item.productName || typeof item.productName !== "string") {
      return { success: false, message: "Svaki proizvod mora imati naziv." };
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      return { success: false, message: "Kolicina mora biti veca od 0." };
    }
    if (!Number.isFinite(item.price) || item.price <= 0) {
      return { success: false, message: "Cena mora biti veca od 0." };
    }
  }

  if (
    data.userId !== undefined &&
    (!Number.isInteger(data.userId) || Number(data.userId) <= 0)
  ) {
    return { success: false, message: "userId mora biti pozitivan ceo broj." };
  }

  return { success: true };
}

export function validateSalesAnalysis(data: SalesAnalysisDTO): ValidationResult {
  if (!data || typeof data !== "object") {
    return { success: false, message: "Telo zahteva je obavezno." };
  }

  if (!data.periodType || !ALLOWED_PERIOD_TYPES.includes(data.periodType)) {
    return { success: false, message: "periodType mora biti jedan od: daily, weekly, monthly, yearly, total." };
  }

  const periodValue = (data.periodValue ?? "").trim();
  if (data.periodType !== "total" && !periodValue) {
    return { success: false, message: "periodValue je obavezan za izabrani periodType." };
  }

  if (!isValidPeriodByType(data.periodType, periodValue)) {
    return { success: false, message: "periodValue nije u ispravnom formatu za zadati periodType." };
  }

  return { success: true };
}

export function validateTopProductsAnalysis(data: TopProductsDTO): ValidationResult {
  if (!data || typeof data !== "object") {
    return { success: false, message: "Telo zahteva je obavezno." };
  }

  const period = (data.period ?? "").trim();
  if (!period) {
    return { success: false, message: "period je obavezan." };
  }

  if (!isValidGeneralPeriod(period)) {
    return { success: false, message: "period nije u podrzanom formatu." };
  }

  if (
    data.limit !== undefined &&
    (!Number.isInteger(data.limit) || Number(data.limit) <= 0 || Number(data.limit) > 100)
  ) {
    return { success: false, message: "limit mora biti ceo broj u opsegu 1-100." };
  }

  return { success: true };
}

export function validateTrendAnalysis(data: TrendAnalysisDTO): ValidationResult {
  if (!data || typeof data !== "object") {
    return { success: false, message: "Telo zahteva je obavezno." };
  }

  if (!data.analysisType || !ALLOWED_TREND_TYPES.includes(data.analysisType)) {
    return {
      success: false,
      message: "analysisType mora biti jedan od: monthly_trend, product_trend, category_trend.",
    };
  }

  const startDate = parseDateCandidate(data.startDate);
  const endDate = parseDateCandidate(data.endDate);

  if (data.startDate && !startDate) {
    return { success: false, message: "startDate nije validan datum." };
  }
  if (data.endDate && !endDate) {
    return { success: false, message: "endDate nije validan datum." };
  }

  if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
    return { success: false, message: "startDate mora biti manji ili jednak endDate." };
  }

  if (data.analysisType === "product_trend") {
    if (!Number.isInteger(data.productId) || Number(data.productId) <= 0) {
      return { success: false, message: "Za product_trend je obavezan validan productId." };
    }
  }

  return { success: true };
}

function isValidPeriodByType(
  periodType: SalesAnalysisDTO["periodType"],
  periodValue: string
): boolean {
  const value = periodValue.trim().toLowerCase();
  if (periodType === "total") {
    return value === "" || value === "all" || value === "total";
  }

  switch (periodType) {
    case "daily":
      return value === "today" || value === "yesterday" || /^\d{4}-\d{2}-\d{2}$/.test(value);
    case "weekly":
      return (
        value === "this-week" ||
        value === "last-week" ||
        /^\d{4}-w\d{2}$/i.test(value) ||
        /^\d{4}-\d{2}-\d{2}$/.test(value)
      );
    case "monthly":
      return value === "this-month" || value === "last-month" || /^\d{4}-\d{2}$/.test(value);
    case "yearly":
      return value === "this-year" || value === "last-year" || /^\d{4}$/.test(value);
    default:
      return false;
  }
}

function isValidGeneralPeriod(periodValue: string): boolean {
  const value = periodValue.trim().toLowerCase();
  return (
    value === "today" ||
    value === "yesterday" ||
    value === "this-week" ||
    value === "last-week" ||
    value === "this-month" ||
    value === "last-month" ||
    value === "this-year" ||
    value === "last-year" ||
    value === "all" ||
    value === "total" ||
    /^\d{4}$/.test(value) ||
    /^\d{4}-\d{2}$/.test(value) ||
    /^\d{4}-w\d{2}$/i.test(value) ||
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  );
}

function parseDateCandidate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}
