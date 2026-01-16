export interface PerformanceReportDTO {
    id: number;
    naziv: string;
    tip_algoritma: "distributivni_centar" | "magacinski_centar";
    broj_ambalaza_po_slanju: number;
    vreme_obrade_sekunde: number;
    efikasnost_procenat: number;
    brzina_obrade: number;
    podaci_simulacije: any; //json podaci
    zakljucci: string;
    datum_kreiranja: string;
}