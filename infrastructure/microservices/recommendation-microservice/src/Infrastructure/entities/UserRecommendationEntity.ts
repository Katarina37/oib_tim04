import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_recommendations")
export class UserRecommendationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "korisnik_id" })
  korisnikId!: number;

  @Column({ name: "preporuceni_parfemi", type: "json" })
  preporuceniParfemi!: Array<{
    parfemId: number;
    naziv: string;
    preporukaTip: string;
    score: number;
  }>;

  @Column({ name: "tip_preporuke", length: 20 })
  tipPreporuke!: string;

  @CreateDateColumn({ name: "generisan_datum" })
  generisanDatum!: Date;

  @Column({ name: "istice_datum" })
  isticeDatum!: Date;
}