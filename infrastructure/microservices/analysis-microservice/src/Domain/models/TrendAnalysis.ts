export class TrendAnalysis {
    id!: number;

    analysisType!: "monthly_trend" | "product_trend" | "category_trend";

    dataPoints!: Array<{
        label: string;
        value: number;
        date?: string;
        productId?: number;
    }>;

    conclusion?: string;

    generatedAt!: Date;
}
