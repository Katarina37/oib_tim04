export interface RecommendationItemDTO {
    parfemId: number;
    naziv: string;
    tipPreporuke: "popularity" | "collaborative" | "hybrid";
    objasnjenje?: string;
}

export interface UserRecommendationDTO {
    korisnikId: number;
    preporuke: RecommendationItemDTO[];
    generisanDatum: Date;
}