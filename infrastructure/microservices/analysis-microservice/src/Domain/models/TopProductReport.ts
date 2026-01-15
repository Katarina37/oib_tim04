import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity("top_product_reports")
export class TopProductReport{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({name: "period", length: 50})
    period!: string;

    @Column({name: "top_proizvodi", type: "json"})
    topProducts!: Array<{
        productId: number;
        productName: string;
        unitsSold: number;
        revenue: number;
        percentage: number;
    }>;

    @Column({name: "ukupna_zarada_od_top", type: "decimal", precision: 12, scale: 2})
    totalRevenueFromTop!: number;

    @Column({name: "generisan_datum"})
    generatedAt!: Date;
}
