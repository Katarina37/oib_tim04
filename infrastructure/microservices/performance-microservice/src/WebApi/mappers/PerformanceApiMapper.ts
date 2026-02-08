import { AlgorithmType } from "../../Domain/enums/AlgorithmType";
import { PerformanceReport } from "../../Domain/models/PerformanceReport";

export interface PerformanceReportResponseDTO {
  id: number;
  naziv: string;
  tip_algoritma: AlgorithmType;
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

export function mapReportToResponse(report: PerformanceReport): PerformanceReportResponseDTO {
  return {
    id: report.id,
    naziv: report.naziv,
    tip_algoritma: report.tipAlgoritma,
    broj_ambalaza_po_slanju: report.brojAmbalazaPoSlanju,
    vreme_obrade_sekunde: report.vremeObradeSekunde,
    efikasnost_procenat: report.efikasnostProcenat,
    brzina_obrade: report.brzinaObrade,
    podaci_simulacije: {
      broj_zahteva: report.podaciSimulacije.broj_zahteva,
      broj_tura: report.podaciSimulacije.broj_tura,
      idealno_vreme_sekunde: report.podaciSimulacije.idealno_vreme_sekunde,
      faktor_opterecenja: report.podaciSimulacije.faktor_opterecenja,
      prosek_vreme_po_turi: report.podaciSimulacije.prosek_vreme_po_turi,
      preporuka: report.podaciSimulacije.preporuka,
    },
    zakljucci: report.zakljucci,
    datum_kreiranja: report.datumKreiranja.toISOString(),
  };
}
