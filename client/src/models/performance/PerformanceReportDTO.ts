export interface PerformanceReportDTO {
  id: number;
  naziv: string;
  tip_algoritma: "distributivni_centar" | "magacinski_centar";
  broj_ambalaza_po_slanju: number;
  vreme_obrade_sekunde: number;
  efikasnost_procenat: number;
  brzina_obrade: number;
  podaci_simulacije: {
    broj_zahteva: number;
    broj_tura: number;
    idealno_vreme_sekunde: number;
    faktor_opterecenja: number;
    prosek_vreme_po_turi: number;
    preporuka: string;
  };
  zakljucci: string;
  datum_kreiranja: string;
}
