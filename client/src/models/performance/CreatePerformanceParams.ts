export interface CreatePerformanceParams {
  naziv: string;
  tip_algoritma: "distributivni_centar" | "magacinski_centar";
  broj_zahteva?: number;
}
