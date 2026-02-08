import React from "react";
import { Download, BarChart2, Activity } from "lucide-react";
import { PerformanceReportDTO } from "../../models/performance/PerformanceReportDTO";
import { formatDateTime } from "../../helpers/formatters";

interface PerformanceReportsTableProps {
  reports: PerformanceReportDTO[];
  onExport?: (id: number) => void;
  onViewDetails?: (report: PerformanceReportDTO) => void;
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

const PerformanceReportsTable: React.FC<PerformanceReportsTableProps> = ({
  reports,
  onExport,
  onViewDetails,
}) => {
  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <p className="text-muted">Nema podataka o simulacijama performansi.</p>
      </div>
    );
  }

  return (
    <div className="performance-table">
      <div className="performance-table__header">
        <h4 className="font-medium">
          <Activity size={18} />
          Istorija performansi logistickih algoritama
        </h4>
        <span className="text-muted">Ukupno: {reports.length}</span>
      </div>

      <div className="table-container">
        <table className="table performance-table__grid">
          <thead>
            <tr>
              <th>Naziv</th>
              <th>Algoritam</th>
              <th>Zahtevi</th>
              <th>Vreme</th>
              <th>Brzina</th>
              <th>Efikasnost</th>
              <th>Datum</th>
              <th className="text-right">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const algorithm = getAlgorithmMeta(report.tip_algoritma);

              return (
                <tr key={report.id}>
                  <td>{report.naziv}</td>
                  <td className="performance-table__algorithm">
                    <span className={`badge ${algorithm.badgeClassName}`}>{algorithm.label}</span>
                  </td>
                  <td>{report.podaci_simulacije.broj_zahteva}</td>
                  <td>{report.vreme_obrade_sekunde.toFixed(3)}s</td>
                  <td>{report.brzina_obrade.toFixed(3)} amb/s</td>
                  <td>
                    <div className="performance-progress">
                      <span>{report.efikasnost_procenat.toFixed(2)}%</span>
                      <div className="performance-progress__track">
                        <div
                          className="performance-progress__value"
                          style={{ width: `${Math.min(report.efikasnost_procenat, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>{formatDateTime(report.datum_kreiranja)}</td>
                  <td className="text-right">
                    <div className="performance-table__actions">
                      {onViewDetails && (
                        <button
                          className="btn btn--ghost btn--sm btn--icon"
                          onClick={() => onViewDetails(report)}
                          title="Detalji izvestaja"
                          type="button"
                        >
                          <BarChart2 size={16} />
                        </button>
                      )}
                      {onExport && (
                        <button
                          className="btn btn--ghost btn--sm btn--icon"
                          onClick={() => onExport(report.id)}
                          title="Preuzmi PDF"
                          type="button"
                        >
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceReportsTable;
