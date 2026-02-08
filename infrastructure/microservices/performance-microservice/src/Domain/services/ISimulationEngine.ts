import { AlgorithmType } from "../enums/AlgorithmType";
import { SimulationData } from "../models/PerformanceReport";

export interface SimulationInput {
  tipAlgoritma: AlgorithmType;
  brojZahteva: number;
}

export interface SimulationOutput {
  brojAmbalazaPoSlanju: number;
  vremeObradeSekunde: number;
  efikasnostProcenat: number;
  brzinaObrade: number;
  podaciSimulacije: SimulationData;
  zakljucci: string;
}

export interface ISimulationEngine {
  run(input: SimulationInput): SimulationOutput;
}
