export interface SalesAnalysisDTO {
  periodType: "daily" | "weekly" | "monthly" | "yearly" | "total";
  periodValue: string;
}