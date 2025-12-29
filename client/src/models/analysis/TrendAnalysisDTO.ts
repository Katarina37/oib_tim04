export interface TrendAnalysisDTO{
    id: string;
    analysisType: "monthly_trend" | "product_trend" | "category_trend";
    dataPoints: Array<{
        label: string;
        value: number;
        date?: string;
        productId?: string;
    }>;
    conclusion?: string;
    generatedAt: string;
}


