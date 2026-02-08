import { AlgorithmType } from "../../Domain/enums/AlgorithmType";
import { ISimulationEngine, SimulationInput, SimulationOutput } from "../../Domain/services/ISimulationEngine";

interface AlgorithmProfile {
  brojAmbalazaPoSlanju: number;
  vremePoTuriSekunde: number;
}

const ALGORITHM_PROFILES: Record<AlgorithmType, AlgorithmProfile> = {
  [AlgorithmType.DISTRIBUTION_CENTER]: {
    brojAmbalazaPoSlanju: 3,
    vremePoTuriSekunde: 0.5,
  },
  [AlgorithmType.WAREHOUSE_CENTER]: {
    brojAmbalazaPoSlanju: 1,
    vremePoTuriSekunde: 2.5,
  },
};

export class DeterministicSimulationEngine implements ISimulationEngine {
  run(input: SimulationInput): SimulationOutput {
    const profile = ALGORITHM_PROFILES[input.tipAlgoritma];
    const brojTura = Math.ceil(input.brojZahteva / profile.brojAmbalazaPoSlanju);
    const idealnoVremeSekunde = brojTura * profile.vremePoTuriSekunde;

    const bazniFaktor = input.tipAlgoritma === AlgorithmType.DISTRIBUTION_CENTER ? 0.03 : 0.1;
    const faktorOpterecenja = this.round(
      Math.min(0.35, bazniFaktor + Math.log10(input.brojZahteva + 1) * 0.06),
      3
    );

    const vremeObradeSekunde = this.round(
      idealnoVremeSekunde * (1 + faktorOpterecenja),
      3
    );
    const efikasnostProcenat = this.round(
      Math.min(100, (idealnoVremeSekunde / vremeObradeSekunde) * 100),
      2
    );
    const brzinaObrade = this.round(input.brojZahteva / vremeObradeSekunde, 3);
    const prosekVremePoTuri = this.round(vremeObradeSekunde / brojTura, 3);

    const preporuka = this.resolveRecommendation(input.tipAlgoritma, efikasnostProcenat);
    const zakljucci = this.resolveConclusion(
      input.tipAlgoritma,
      efikasnostProcenat,
      brzinaObrade
    );

    return {
      brojAmbalazaPoSlanju: profile.brojAmbalazaPoSlanju,
      vremeObradeSekunde,
      efikasnostProcenat,
      brzinaObrade,
      podaciSimulacije: {
        broj_zahteva: input.brojZahteva,
        broj_tura: brojTura,
        idealno_vreme_sekunde: this.round(idealnoVremeSekunde, 3),
        faktor_opterecenja: faktorOpterecenja,
        prosek_vreme_po_turi: prosekVremePoTuri,
        preporuka,
      },
      zakljucci,
    };
  }

  private resolveRecommendation(algorithm: AlgorithmType, efficiency: number): string {
    if (algorithm === AlgorithmType.DISTRIBUTION_CENTER) {
      if (efficiency >= 90) {
        return "Distributivni centar je stabilan za grupna slanja.";
      }
      if (efficiency >= 75) {
        return "Povecati broj paralelnih tokova za distributivni centar.";
      }
      return "Distributivni centar zahteva optimizaciju rasporeda i redova cekanja.";
    }

    if (efficiency >= 90) {
      return "Magacinski centar radi dobro za pojedinacna i hitna slanja.";
    }
    if (efficiency >= 75) {
      return "Za veci obim poslova, preporuka je preusmeravanje na distributivni centar.";
    }
    return "Magacinski centar je usko grlo pri vecem opterecenju.";
  }

  private resolveConclusion(
    algorithm: AlgorithmType,
    efficiency: number,
    throughput: number
  ): string {
    const algorithmLabel =
      algorithm === AlgorithmType.DISTRIBUTION_CENTER
        ? "Distributivni centar"
        : "Magacinski centar";

    if (efficiency >= 90) {
      return `${algorithmLabel} ostvaruje vrlo dobar rezultat (${efficiency.toFixed(
        2
      )}% efikasnosti) uz propusnost ${throughput.toFixed(3)} amb/s.`;
    }

    if (efficiency >= 75) {
      return `${algorithmLabel} radi stabilno, ali postoji prostor za optimizaciju (${
        efficiency.toFixed(2)
      }% efikasnosti, ${throughput.toFixed(3)} amb/s).`;
    }

    return `${algorithmLabel} pokazuje pad performansi (${efficiency.toFixed(
      2
    )}% efikasnosti). Potrebna je optimizacija logistickog toka.`;
  }

  private round(value: number, precision: number): number {
    const multiplier = 10 ** precision;
    return Math.round(value * multiplier) / multiplier;
  }
}
