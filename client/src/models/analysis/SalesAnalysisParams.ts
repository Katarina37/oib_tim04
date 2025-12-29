export interface SalesAnalysisParams{
    periodType: "daily" | "weekly" | "monthly" | "yearly" | "total";
    periodValue: string;
}