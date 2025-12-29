export interface TrendAnalysisParams{
    analysisType: "monthly_trend" | "product_trend" | "category_trend";
    startDate?: string;
    endDate?: string;
    productId?: string;
}