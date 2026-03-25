import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Info,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Siren,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import ConfirmModal from "../components/common/ConfirmModal";
import StatsCard from "../components/production/StatsCard";
import { useServices } from "../contexts/ServiceContext";
import { formatDateTime } from "../helpers/formatters";
import { useAuth } from "../hooks/useAuthHook";
import { IncidentSeverity } from "../models/security_incidents/IncidentSeverity";
import { IncidentStatus } from "../models/security_incidents/IncidentStatus";
import { IncidentType } from "../models/security_incidents/IncidentType";
import { SecurityIncidentDTO } from "../models/security_incidents/SecurityIncidentDTO";

type StatusFilter = "ALL" | IncidentStatus;
type SeverityFilter = "ALL" | IncidentSeverity;

interface PendingStatusAction {
  incidentId: number;
  status: IncidentStatus;
}

const statusLabel: Record<IncidentStatus, string> = {
  [IncidentStatus.OPEN]: "Otvoren",
  [IncidentStatus.IN_PROGRESS]: "U obradi",
  [IncidentStatus.RESOLVED]: "Rešen",
  [IncidentStatus.FALSE_POSITIVE]: "False positive",
};

const typeLabel: Record<IncidentType, string> = {
  [IncidentType.BRUTE_FORCE_LOGIN]: "Brute-force login",
  [IncidentType.UNAUTHORIZED_ACCESS_PATTERN]: "Neovlašćeni pristup",
  [IncidentType.ERROR_SPIKE]: "Error spike",
};

const severityBadgeClass: Record<IncidentSeverity, string> = {
  [IncidentSeverity.LOW]: "badge badge--info",
  [IncidentSeverity.MEDIUM]: "badge badge--warning",
  [IncidentSeverity.HIGH]: "badge badge--error",
  [IncidentSeverity.CRITICAL]: "badge badge--critical",
};

const statusBadgeClass: Record<IncidentStatus, string> = {
  [IncidentStatus.OPEN]: "badge badge--error",
  [IncidentStatus.IN_PROGRESS]: "badge badge--warning",
  [IncidentStatus.RESOLVED]: "badge badge--success",
  [IncidentStatus.FALSE_POSITIVE]: "badge badge--info",
};

const severityWeight: Record<IncidentSeverity, number> = {
  [IncidentSeverity.CRITICAL]: 4,
  [IncidentSeverity.HIGH]: 3,
  [IncidentSeverity.MEDIUM]: 2,
  [IncidentSeverity.LOW]: 1,
};

const SecurityIncidentsPage: React.FC = () => {
  const { token } = useAuth();
  const { securityIncidentAPI } = useServices();

  const [incidents, setIncidents] = useState<SecurityIncidentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRunningScan, setIsRunningScan] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ALL");
  const [search, setSearch] = useState("");
  const [scanLookback, setScanLookback] = useState("30");
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [pendingStatusAction, setPendingStatusAction] = useState<PendingStatusAction | null>(null);

  const loadIncidents = useCallback(
    async (showRefreshing = false): Promise<void> => {
      if (!token) {
        setIsLoading(false);
        setIncidents([]);
        return;
      }

      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await securityIncidentAPI.getAll(token);
        setIncidents(data);
        setSelectedIncidentId((currentId) => {
          if (data.length === 0) {
            return null;
          }

          if (!currentId) {
            return data[0].id;
          }

          return data.some((incident) => incident.id === currentId) ? currentId : data[0].id;
        });
      } catch (requestError) {
        console.error(requestError);
        setError("Greška pri učitavanju security incident evidencije.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [securityIncidentAPI, token]
  );

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (!autoRefreshEnabled || !token) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadIncidents(true);
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoRefreshEnabled, loadIncidents, token]);

  const filteredIncidents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...incidents]
      .filter((incident) => {
        if (statusFilter !== "ALL" && incident.status !== statusFilter) {
          return false;
        }

        if (severityFilter !== "ALL" && incident.severity !== severityFilter) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const haystack = [
          incident.title,
          incident.description,
          incident.fingerprint,
          incident.sourceMicroservice ?? "",
          typeLabel[incident.incidentType],
          statusLabel[incident.status],
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .sort((first, second) => {
        const severityDelta = severityWeight[second.severity] - severityWeight[first.severity];
        if (severityDelta !== 0) {
          return severityDelta;
        }

        return new Date(second.detectedAt).getTime() - new Date(first.detectedAt).getTime();
      });
  }, [incidents, search, severityFilter, statusFilter]);

  const selectedIncident = useMemo(
    () => filteredIncidents.find((incident) => incident.id === selectedIncidentId) ?? null,
    [filteredIncidents, selectedIncidentId]
  );

  const stats = useMemo(() => {
    const openCount = incidents.filter((incident) => incident.status === IncidentStatus.OPEN).length;
    const inProgressCount = incidents.filter(
      (incident) => incident.status === IncidentStatus.IN_PROGRESS
    ).length;
    const criticalCount = incidents.filter(
      (incident) => incident.severity === IncidentSeverity.CRITICAL
    ).length;
    const resolvedCount = incidents.filter(
      (incident) =>
        incident.status === IncidentStatus.RESOLVED ||
        incident.status === IncidentStatus.FALSE_POSITIVE
    ).length;

    return {
      openCount,
      inProgressCount,
      criticalCount,
      resolvedCount,
    };
  }, [incidents]);

  const trendData = useMemo(() => {
    const days = 7;
    const points: Array<{ label: string; total: number; critical: number }> = [];

    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - index);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const total = incidents.filter((incident) => {
        const detectedAt = new Date(incident.detectedAt).getTime();
        return detectedAt >= date.getTime() && detectedAt < nextDate.getTime();
      }).length;

      const critical = incidents.filter((incident) => {
        const detectedAt = new Date(incident.detectedAt).getTime();
        return (
          detectedAt >= date.getTime() &&
          detectedAt < nextDate.getTime() &&
          incident.severity === IncidentSeverity.CRITICAL
        );
      }).length;

      points.push({
        label: date.toLocaleDateString("sr-RS", { day: "2-digit", month: "2-digit" }),
        total,
        critical,
      });
    }

    return points;
  }, [incidents]);

  const hasTrendData = useMemo(
    () => trendData.some((point) => point.total > 0 || point.critical > 0),
    [trendData]
  );

  const handleRunScan = async (): Promise<void> => {
    if (!token) {
      return;
    }

    setError(null);
    setSuccess(null);

    const parsedLookback = Number.parseInt(scanLookback, 10);
    const lookbackMinutes = Number.isInteger(parsedLookback) && parsedLookback > 0 ? parsedLookback : undefined;

    setIsRunningScan(true);
    try {
      const result = await securityIncidentAPI.runScan(lookbackMinutes, token);
      setSuccess(
        `Scan uspešan: kreirano ${result.created}, ažurirano ${result.updated}, analizirano logova ${result.evaluatedLogs}.`
      );
      await loadIncidents(true);
    } catch (requestError) {
      console.error(requestError);
      setError("Pokretanje scan-a nije uspelo.");
    } finally {
      setIsRunningScan(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: IncidentStatus): Promise<void> => {
    if (!token) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUpdatingStatus(id);

    try {
      await securityIncidentAPI.updateStatus(id, status, token);
      setSuccess(`Incident #${id} je ažuriran na status: ${statusLabel[status]}.`);
      await loadIncidents(true);
    } catch (requestError) {
      console.error(requestError);
      setError("Ažuriranje statusa incidenta nije uspelo.");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const requestStatusUpdate = (incidentId: number, status: IncidentStatus): void => {
    setPendingStatusAction({ incidentId, status });
  };

  const confirmStatusUpdate = async (): Promise<void> => {
    if (!pendingStatusAction) {
      return;
    }

    await handleUpdateStatus(pendingStatusAction.incidentId, pendingStatusAction.status);
    setPendingStatusAction(null);
  };

  return (
    <div className="analysis-page security-incidents-page">
      <div className="page-header page-header--with-action">
        <div>
          <h1 className="page-header__title">Security Incident Center</h1>
          <p className="page-header__subtitle">
            Pregled kritičnih bezbednosnih obrazaca i operativna obrada incidenata.
          </p>
        </div>
        <div className="security-incidents-header-actions">
          <div className="security-incidents-scan-controls">
            <label htmlFor="scan-lookback" className="text-muted">
              Lookback (min)
            </label>
            <input
              id="scan-lookback"
              className="input"
              type="number"
              min={1}
              max={1440}
              value={scanLookback}
              onChange={(event) => setScanLookback(event.target.value)}
            />
          </div>
          <button className="btn btn--primary" onClick={() => void handleRunScan()} disabled={isRunningScan}>
            <ShieldAlert size={16} />
            {isRunningScan ? "Skeniram..." : "Run Scan"}
          </button>
          <button
            className="btn btn--secondary"
            onClick={() => void loadIncidents(true)}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? "icon-spin" : ""} />
            {isRefreshing ? "Osvežavanje..." : "Osveži"}
          </button>
          <label className="security-incidents-auto-refresh">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(event) => setAutoRefreshEnabled(event.target.checked)}
            />
            <Clock3 size={14} />
            Auto-refresh 60s
          </label>
        </div>
      </div>

      {error && (
        <div className="storage-alert storage-alert--error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="storage-alert storage-alert--success">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="stats-grid">
        <StatsCard icon={<ShieldAlert size={24} />} value={stats.openCount} label="Otvoreni" />
        <StatsCard icon={<Siren size={24} />} value={stats.criticalCount} label="Critical" />
        <StatsCard icon={<ShieldCheck size={24} />} value={stats.inProgressCount} label="U obradi" />
        <StatsCard icon={<ShieldX size={24} />} value={stats.resolvedCount} label="Zatvoreni" />
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">
            <Siren size={20} className="card__title-icon" />
            Trend incidenata (7 dana)
          </h2>
          <span className="text-muted">Ukupno i critical po danu</span>
        </div>
        <div className="card__body">
          {hasTrendData ? (
            <div className="security-incidents-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ec" />
                  <XAxis dataKey="label" stroke="#8a9bac" fontSize={11} />
                  <YAxis stroke="#8a9bac" fontSize={11} allowDecimals={false} />
                  <Line type="monotone" dataKey="total" stroke="#4db896" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="critical" stroke="#f87171" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="security-incidents-chart-empty">
              <Info size={18} />
              <span>Nema incidenata u poslednjih 7 dana.</span>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card__body security-incidents-filters">
          <div className="input-group">
            <label className="input-group__label" htmlFor="incident-search">
              Pretraga
            </label>
            <div className="security-incidents-search-wrap">
              <Search size={16} />
              <input
                id="incident-search"
                className="input"
                placeholder="Naslov, opis, fingerprint, mikroservis..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-group__label" htmlFor="incident-status-filter">
              Status
            </label>
            <select
              id="incident-status-filter"
              className="input select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="ALL">Svi statusi</option>
              <option value={IncidentStatus.OPEN}>{statusLabel[IncidentStatus.OPEN]}</option>
              <option value={IncidentStatus.IN_PROGRESS}>{statusLabel[IncidentStatus.IN_PROGRESS]}</option>
              <option value={IncidentStatus.RESOLVED}>{statusLabel[IncidentStatus.RESOLVED]}</option>
              <option value={IncidentStatus.FALSE_POSITIVE}>
                {statusLabel[IncidentStatus.FALSE_POSITIVE]}
              </option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-group__label" htmlFor="incident-severity-filter">
              Ozbiljnost
            </label>
            <select
              id="incident-severity-filter"
              className="input select"
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value as SeverityFilter)}
            >
              <option value="ALL">Sve</option>
              <option value={IncidentSeverity.LOW}>LOW</option>
              <option value={IncidentSeverity.MEDIUM}>MEDIUM</option>
              <option value={IncidentSeverity.HIGH}>HIGH</option>
              <option value={IncidentSeverity.CRITICAL}>CRITICAL</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">
            <ShieldAlert size={20} className="card__title-icon" />
            Security incident evidencija
          </h2>
          <span className="text-muted">Prikazano: {filteredIncidents.length}</span>
        </div>
        <div className="card__body">
          {isLoading ? (
            <div className="security-incidents-empty">Učitavanje incidenta...</div>
          ) : filteredIncidents.length === 0 ? (
            <div className="security-incidents-empty">Nema incidenata za prikaz sa izabranim filterima.</div>
          ) : (
            <div className="table-container">
              <table className="table table--striped security-incidents-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tip</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Mikroservis</th>
                    <th>Ponavljanja</th>
                    <th>Detektovan</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((incident) => {
                    const isSelected = selectedIncidentId === incident.id;
                    const isUpdatingThisRow = isUpdatingStatus === incident.id;

                    return (
                      <tr
                        key={incident.id}
                        className={isSelected ? "security-incidents-row--selected" : ""}
                        onClick={() => setSelectedIncidentId(incident.id)}
                      >
                        <td>#{incident.id}</td>
                        <td>{typeLabel[incident.incidentType]}</td>
                        <td>
                          <span className={severityBadgeClass[incident.severity]}>{incident.severity}</span>
                        </td>
                        <td>
                          <span className={statusBadgeClass[incident.status]}>{statusLabel[incident.status]}</span>
                        </td>
                        <td>{incident.sourceMicroservice ?? "-"}</td>
                        <td>{incident.occurrenceCount}</td>
                        <td>{formatDateTime(incident.detectedAt)}</td>
                        <td>
                          <div className="security-incidents-actions">
                            <button
                              className="btn btn--ghost btn--icon btn--sm"
                              title="U obradi"
                              disabled={isUpdatingThisRow || incident.status === IncidentStatus.IN_PROGRESS}
                              onClick={(event) => {
                                event.stopPropagation();
                                requestStatusUpdate(incident.id, IncidentStatus.IN_PROGRESS);
                              }}
                            >
                              <ShieldCheck size={14} />
                            </button>
                            <button
                              className="btn btn--outline btn--icon btn--sm"
                              title="Rešen"
                              disabled={isUpdatingThisRow || incident.status === IncidentStatus.RESOLVED}
                              onClick={(event) => {
                                event.stopPropagation();
                                requestStatusUpdate(incident.id, IncidentStatus.RESOLVED);
                              }}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button
                              className="btn btn--danger btn--icon btn--sm"
                              title="False positive"
                              disabled={isUpdatingThisRow || incident.status === IncidentStatus.FALSE_POSITIVE}
                              onClick={(event) => {
                                event.stopPropagation();
                                requestStatusUpdate(incident.id, IncidentStatus.FALSE_POSITIVE);
                              }}
                            >
                              <ShieldX size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedIncident && (
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Siren size={20} className="card__title-icon" />
              Incident detalji #{selectedIncident.id}
            </h2>
            <span className="text-muted">Fingerprint: {selectedIncident.fingerprint}</span>
          </div>
          <div className="card__body security-incident-details-grid">
            <div className="security-incident-detail">
              <span className="text-muted">Naslov</span>
              <strong>{selectedIncident.title}</strong>
            </div>
            <div className="security-incident-detail">
              <span className="text-muted">Opis</span>
              <strong>{selectedIncident.description}</strong>
            </div>
            <div className="security-incident-detail">
              <span className="text-muted">Poslednje poklapanje</span>
              <strong>{formatDateTime(selectedIncident.lastMatchedAt)}</strong>
            </div>
            <div className="security-incident-detail">
              <span className="text-muted">Resolved at</span>
              <strong>
                {selectedIncident.resolvedAt ? formatDateTime(selectedIncident.resolvedAt) : "-"}
              </strong>
            </div>
            <div className="security-incident-detail security-incident-detail--full">
              <span className="text-muted">Evidence</span>
              <pre className="security-incident-evidence">
                {JSON.stringify(selectedIncident.evidence ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={pendingStatusAction !== null}
        onClose={() => setPendingStatusAction(null)}
        onConfirm={() => {
          void confirmStatusUpdate();
        }}
        title="Potvrda promene statusa"
        message={
          pendingStatusAction
            ? `Da li ste sigurni da želite da incident #${pendingStatusAction.incidentId} prebacite na status '${statusLabel[pendingStatusAction.status]}'?`
            : ""
        }
        confirmText="Potvrdi"
        cancelText="Otkaži"
        isLoading={isUpdatingStatus !== null}
        variant="warning"
      />
    </div>
  );
};

export default SecurityIncidentsPage;
