export interface RecommendedPerfume {
    parfemId: number;
    naziv: string;
    tipPreporuke: string;
    score: number; 
}

export class UserRecommendation {
  id!: number;
  korisnikId!: number;
  preporuceniParfemi!: RecommendedPerfume[];
  tipPreporuke!: string; 
  generisanDatum!: Date;
  isticeDatum!: Date;
}