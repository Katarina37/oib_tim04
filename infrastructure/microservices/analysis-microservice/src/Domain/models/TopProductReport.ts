export class TopProductReport{
    id!: number;

    period!: string;

    topProducts!: Array<{
        productId: number;
        productName: string;
        unitsSold: number;
        revenue: number;
        percentage: number;
    }>;

    totalRevenueFromTop!: number;

    generatedAt!: Date;
}
