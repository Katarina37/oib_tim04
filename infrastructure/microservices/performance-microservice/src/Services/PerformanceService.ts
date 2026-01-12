import { IPerformanceService } from "../Domain/services/IPerformanceService";
import { IPerformanceRepository } from "../Domain/repositories/IPerformanceRepository";
import { PerformanceReport } from "../Domain/models/PerformanceReport";
import { RunSimulationDTO } from "../Domain/DTOs/RunSimulationDTO";

export class PerformanceService implements IPerformanceService{
    constructor(private repository: IPerformanceRepository){}   //konstruktor mi prima rep
    
    async runSimulation(data: RunSimulationDTO ): Promise<PerformanceReport> {
        const { tip_algoritma, naziv } = data;
        const kriterijumAmbalaza = tip_algoritma === "distributivni_centar" ? 3 : 1;
        const kriterijumSekunda = tip_algoritma === "distributivni_centar" ? 0.5 : 2.5;
    
        const pocetak = Date.now();
        await new Promise(resolve => setTimeout(resolve, kriterijumSekunda*1000));
        const kraj = Date.now();
        
        const stvarnoVreme = (kraj - pocetak) / 1000;
        const efikasnost = (kriterijumSekunda/stvarnoVreme) * 100;
        const brzina = kriterijumAmbalaza/stvarnoVreme;

        //objekat u bazi se popunjava
        const report = new PerformanceReport();
        report.naziv = naziv;
        report.tip_algoritma = tip_algoritma;
        report.broj_ambalaza_po_slanju = kriterijumAmbalaza;
        report.vreme_obrade_sekunde = stvarnoVreme;
        report.efikasnost_procenat = efikasnost;
        report.brzina_obrade = brzina;
        report.podaci_simulacije = { runda: 1, status: "Uspešno", timestamp: new Date().toISOString()};
        report.zakljucci = efikasnost >= 95 ? "Sistem radi u okviru kriterijuma." : "Uocena su manja odstupanja u brzini.";
    
        return await this.repository.saveReport(report);
    }

    async getAllReports(): Promise<PerformanceReport[]> {
        return await this.repository.findAll();
    }

    async getReportById(id: number): Promise<PerformanceReport | null> {
        return await this.repository.findById(id);
    }
    
}



