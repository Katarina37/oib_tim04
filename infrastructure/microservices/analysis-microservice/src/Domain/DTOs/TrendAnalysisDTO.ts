export interface TrendAnalysisDTO {
  analysisType: "monthly_trend" | "product_trend" | "category_trend";
  startDate?: Date;
  endDate?: Date;
  productId?: string;
}