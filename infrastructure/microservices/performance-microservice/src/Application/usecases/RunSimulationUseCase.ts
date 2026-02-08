import { RunSimulationDTO } from "../../Domain/DTOs/RunSimulationDTO";
import { NewPerformanceReport, PerformanceReport } from "../../Domain/models/PerformanceReport";
import { IPerformanceRepository } from "../../Domain/repositories/IPerformanceRepository";
import { ISimulationEngine } from "../../Domain/services/ISimulationEngine";

const DEFAULT_REQUEST_COUNT = 60;

export class RunSimulationUseCase {
  constructor(
    private readonly repository: IPerformanceRepository,
    private readonly simulationEngine: ISimulationEngine
  ) {}

  async execute(request: RunSimulationDTO): Promise<PerformanceReport> {
    const brojZahteva = request.broj_zahteva ?? DEFAULT_REQUEST_COUNT;
    const simulation = this.simulationEngine.run({
      tipAlgoritma: request.tip_algoritma,
      brojZahteva,
    });

    const newReport: NewPerformanceReport = {
      naziv: request.naziv.trim(),
      tipAlgoritma: request.tip_algoritma,
      brojAmbalazaPoSlanju: simulation.brojAmbalazaPoSlanju,
      vremeObradeSekunde: simulation.vremeObradeSekunde,
      efikasnostProcenat: simulation.efikasnostProcenat,
      brzinaObrade: simulation.brzinaObrade,
      podaciSimulacije: simulation.podaciSimulacije,
      zakljucci: simulation.zakljucci,
    };

    return this.repository.save(newReport);
  }
}
