import React, {useState} from "react";
import { CreatePerformanceParams } from "../../models/performance/CreatePerformanceParams";

interface Props {
  onRunSimulation: (params: CreatePerformanceParams) => void | Promise<void>;
  isLoading: boolean;
}

const PerformanceSimulationForm: React.FC<Props> = ({ onRunSimulation, isLoading }) => {
  const [naziv, setNaziv] = useState("");
  const [tip, setTip] = useState<"distributivni_centar" | "magacinski_centar">(
    "distributivni_centar"
  );
  const [brojZahteva, setBrojZahteva] = useState<number>(60);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nazivTrimmed = naziv.trim();
    if (!nazivTrimmed) {
      return;
    }

    onRunSimulation({
      naziv: nazivTrimmed,
      tip_algoritma: tip,
      broj_zahteva: brojZahteva,
    });
  };

  return (
    <form className="performance-form" onSubmit={handleSubmit}>
      <div className="performance-form__grid">
        <div className="input-group">
          <label className="input-group__label" htmlFor="performance-name">
            Naziv simulacije
          </label>
          <input
            id="performance-name"
            className="input"
            type="text"
            minLength={3}
            maxLength={200}
            value={naziv}
            onChange={(event) => setNaziv(event.target.value)}
            placeholder="npr. Q1 logisticka simulacija"
            required
          />
        </div>

        <div className="input-group">
          <label className="input-group__label" htmlFor="performance-algorithm">
            Tip algoritma
          </label>
          <select
            id="performance-algorithm"
            className="input select"
            value={tip}
            onChange={(event) =>
              setTip(event.target.value as "distributivni_centar" | "magacinski_centar")
            }
          >
            <option value="distributivni_centar">Distributivni centar</option>
            <option value="magacinski_centar">Magacinski centar</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-group__label" htmlFor="performance-count">
            Broj zahteva
          </label>
          <input
            id="performance-count"
            className="input"
            type="number"
            min={1}
            max={5000}
            value={brojZahteva}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              setBrojZahteva(Number.isNaN(parsed) ? 1 : parsed);
            }}
            required
          />
        </div>
      </div>

      <div className="performance-form__footer">
        <p className="text-muted">
          Model koristi parametre: distributivni centar (3 ambalaze / 0.5s), magacinski centar
          (1 ambalaza / 2.5s).
        </p>
        <button className="btn btn--primary" type="submit" disabled={isLoading || naziv.trim().length < 3}>
          {isLoading ? "Pokretanje..." : "Pokreni simulaciju"}
        </button>
      </div>
    </form>
  );
};

export default PerformanceSimulationForm;
