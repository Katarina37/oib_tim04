export interface SalesReportDTO{
    id: number;
    periodType: "daily" | "weekly" | "monthly" | "yearly" | "total";
    periodValue: string;
    totalSales: number;
    totalUnitsSold: number;
    revenue: number;
    details?: {
        topProducts?: Array<{
            productId: number;
            productName: string;
            unitsSold: number;
            revenue: number;
        }>;
        averageSaleValue?: number;
        [key: string]: any;
    };
    generatedAt: string;
}

