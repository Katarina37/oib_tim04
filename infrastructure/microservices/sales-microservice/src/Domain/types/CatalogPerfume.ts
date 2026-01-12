import { PerfumeType } from "../enums/PerfumeType";

export type CatalogPerfume = {
    id: number;
    naziv: string;
    tip: PerfumeType;
    neto_kolicina: 150 | 250;
    serijski_broj: string;
    cena: number;
    stanje_zaliha: number;
} 