export interface TrendAnalysisDTO {
  analysisType: "monthly_trend" | "product_trend";
  startDate?: Date;
  endDate?: Date;
  productId?: string;
}