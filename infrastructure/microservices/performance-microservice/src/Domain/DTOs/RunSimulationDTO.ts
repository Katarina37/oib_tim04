import { AlgorithmType } from "../enums/AlgorithmType";

export interface RunSimulationDTO {
  naziv: string;
  tip_algoritma: AlgorithmType;
  broj_zahteva?: number;
}
