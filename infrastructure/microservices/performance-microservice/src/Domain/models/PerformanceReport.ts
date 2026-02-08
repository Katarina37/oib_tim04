import { AlgorithmType } from "../enums/AlgorithmType";

export interface SimulationData {
  broj_zahteva: number;
  broj_tura: number;
  idealno_vreme_sekunde: number;
  faktor_opterecenja: number;
  prosek_vreme_po_turi: number;
  preporuka: string;
}

export interface NewPerformanceReport {
  naziv: string;
  tipAlgoritma: AlgorithmType;
  brojAmbalazaPoSlanju: number;
  vremeObradeSekunde: number;
  efikasnostProcenat: number;
  brzinaObrade: number;
  podaciSimulacije: SimulationData;
  zakljucci: string;
}

export interface PerformanceReport extends NewPerformanceReport {
  id: number;
  datumKreiranja: Date;
}
