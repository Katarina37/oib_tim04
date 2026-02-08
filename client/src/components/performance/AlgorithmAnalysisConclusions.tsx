import React from "react";
import { Lightbulb, Info, Zap } from "lucide-react";
import { PerformanceReportDTO } from "../../models/performance/PerformanceReportDTO";
import { formatDateTime } from "../../helpers/formatters";

interface AlgorithmAnalysisConclusionsProps {
  selectedReport: PerformanceReportDTO | null;
}

const getAlgorithmMeta = (
  algorithm: PerformanceReportDTO["tip_algoritma"]
): { label: string; badgeClassName: string } => {
  if (algorithm === "distributivni_centar") {
    return {
      label: "Distributivni centar",
      badgeClassName: "badge--performance-distribution",
    };
  }

  return {
    label: "Magacinski centar",
    badgeClassName: "badge--performance-warehouse",
  };
};

const AlgorithmAnalysisConclusions: React.FC<AlgorithmAnalysisConclusionsProps> = ({ selectedReport }) => {
  if (!selectedReport) {
    return (
      <div className="performance-conclusion performance-conclusion--empty">
        <Info size={38} />
        <p>Izaberite izvestaj iz istorije kako bi se prikazali detaljni zakljucci.</p>
      </div>
    );
  }

  const algorithm = getAlgorithmMeta(selectedReport.tip_algoritma);

  return (
    <div className="performance-conclusion">
      <div className="performance-conclusion__header">
        <Lightbulb size={18} />
        <h4>Zakljucak analize: {selectedReport.naziv}</h4>
      </div>

      <div className="performance-conclusion__body">
        <blockquote>{selectedReport.zakljucci}</blockquote>

        <div className="performance-conclusion__stats">
          <div className="performance-conclusion__stat">
            <span>Brzina obrade</span>
            <strong>
              <Zap size={14} />
              {selectedReport.brzina_obrade.toFixed(3)} amb/s
            </strong>
          </div>
          <div className="performance-conclusion__stat">
            <span>Efikasnost</span>
            <strong>{selectedReport.efikasnost_procenat.toFixed(2)}%</strong>
          </div>
          <div className="performance-conclusion__stat">
            <span>Broj zahteva</span>
            <strong>{selectedReport.podaci_simulacije.broj_zahteva}</strong>
          </div>
          <div className="performance-conclusion__stat">
            <span>Broj tura</span>
            <strong>{selectedReport.podaci_simulacije.broj_tura}</strong>
          </div>
        </div>
      </div>

      <div className="performance-conclusion__footer">
        <span>
          Tip: <span className={`badge ${algorithm.badgeClassName}`}>{algorithm.label}</span>
        </span>
        <span>Datum: {formatDateTime(selectedReport.datum_kreiranja)}</span>
      </div>
    </div>
  );
};

export default AlgorithmAnalysisConclusions;


