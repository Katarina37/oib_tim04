export interface TopProductReportDTO{
    id: string;
    period: string;
    topProducts: Array<{
        productId: string;
        productName: string;
        unitsSold: number;
        revenue: number;
        percentage: number;
    }>;
    totalRevenueFromTop: number;
    generatedAt: string;
}

