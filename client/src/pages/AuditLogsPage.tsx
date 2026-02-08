import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileText,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import ConfirmModal from "../components/common/ConfirmModal";
import StatsCard from "../components/production/StatsCard";
import { useServices } from "../contexts/ServiceContext";
import { formatDateTime } from "../helpers/formatters";
import { useAuth } from "../hooks/useAuthHook";
import { AuditLogDTO, AuditLogLevel } from "../models/audit/AuditLogDTO";
import { AuditLogSearchCriteriaDTO } from "../models/audit/AuditLogSearchCriteriaDTO";
import { CreateAuditLogDTO } from "../models/audit/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../models/audit/UpdateAuditLogDTO";

type SortDirection = "DESC" | "ASC";
type AuditSortColumn =
  | "id"
  | "datum_vreme"
  | "tip_zapisa"
  | "mikroservis"
  | "korisnik_id"
  | "ip_adresa"
  | "opis"
  | "dodatni_podaci";
type AuditFormMode = "create" | "edit";

interface AuditFiltersState {
  tip_zapisa: "" | AuditLogLevel;
  opis: string;
  mikroservis: string;
  korisnik_id: string;
  ip_adresa: string;
  datum_od: string;
  datum_do: string;
}

interface AuditFormState {
  tip_zapisa: AuditLogLevel;
  opis: string;
  mikroservis: string;
  korisnik_id: string;
  ip_adresa: string;
  dodatni_podaci: string;
}

const EMPTY_FILTERS: AuditFiltersState = {
  tip_zapisa: "",
  opis: "",
  mikroservis: "",
  korisnik_id: "",
  ip_adresa: "",
  datum_od: "",
  datum_do: "",
};

const EMPTY_FORM: AuditFormState = {
  tip_zapisa: AuditLogLevel.INFO,
  opis: "",
  mikroservis: "",
  korisnik_id: "",
  ip_adresa: "",
  dodatni_podaci: "",
};

const badgeClassByLevel: Record<AuditLogLevel, string> = {
  [AuditLogLevel.INFO]: "badge badge--info",
  [AuditLogLevel.WARNING]: "badge badge--warning",
  [AuditLogLevel.ERROR]: "badge badge--error",
};

const levelLabelByType: Record<AuditLogLevel, string> = {
  [AuditLogLevel.INFO]: "INFO",
  [AuditLogLevel.WARNING]: "WARNING",
  [AuditLogLevel.ERROR]: "ERROR",
};

const normalizeNullableString = (value: string): string | null => {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const compareNumbers = (first: number, second: number): number => first - second;

const compareStrings = (first: string, second: string): number =>
  first.localeCompare(second, "sr", { sensitivity: "base" });

const compareNullableStrings = (
  first: string | null | undefined,
  second: string | null | undefined
): number => compareStrings(first ?? "", second ?? "");

const compareNullableNumbers = (
  first: number | null | undefined,
  second: number | null | undefined
): number => compareNumbers(first ?? Number.MIN_SAFE_INTEGER, second ?? Number.MIN_SAFE_INTEGER);

const parseFiltersToCriteria = (filters: AuditFiltersState): AuditLogSearchCriteriaDTO => {
  const criteria: AuditLogSearchCriteriaDTO = {};

  if (filters.tip_zapisa) {
    criteria.tip_zapisa = filters.tip_zapisa;
  }

  const opis = filters.opis.trim();
  if (opis.length > 0) {
    criteria.opis = opis;
  }

  const mikroservis = filters.mikroservis.trim();
  if (mikroservis.length > 0) {
    criteria.mikroservis = mikroservis;
  }

  const ipAdresa = filters.ip_adresa.trim();
  if (ipAdresa.length > 0) {
    criteria.ip_adresa = ipAdresa;
  }

  const korisnikIdRaw = filters.korisnik_id.trim();
  if (korisnikIdRaw.length > 0) {
    const parsed = Number.parseInt(korisnikIdRaw, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error("Korisnik ID mora biti pozitivan ceo broj.");
    }
    criteria.korisnik_id = parsed;
  }

  if (filters.datum_od) {
    criteria.datum_od = new Date(`${filters.datum_od}T00:00:00`);
  }

  if (filters.datum_do) {
    criteria.datum_do = new Date(`${filters.datum_do}T23:59:59`);
  }

  if (
    criteria.datum_od instanceof Date &&
    criteria.datum_do instanceof Date &&
    criteria.datum_od.getTime() > criteria.datum_do.getTime()
  ) {
    throw new Error("Datum 'od' ne moze biti veci od datuma 'do'.");
  }

  return criteria;
};

const hasCriteria = (criteria: AuditLogSearchCriteriaDTO | null): boolean => {
  if (!criteria) {
    return false;
  }

  return Object.values(criteria).some((value) => value !== undefined && value !== null && value !== "");
};

const parseFormToCreatePayload = (form: AuditFormState): CreateAuditLogDTO => {
  const opis = form.opis.trim();
  if (opis.length === 0) {
    throw new Error("Opis je obavezno polje.");
  }

  let parsedKorisnikId: number | null = null;
  const korisnikIdRaw = form.korisnik_id.trim();
  if (korisnikIdRaw.length > 0) {
    parsedKorisnikId = Number.parseInt(korisnikIdRaw, 10);
    if (!Number.isInteger(parsedKorisnikId) || parsedKorisnikId <= 0) {
      throw new Error("Korisnik ID mora biti pozitivan ceo broj.");
    }
  }

  let parsedAdditionalData: Record<string, unknown> | null = null;
  const additionalDataRaw = form.dodatni_podaci.trim();
  if (additionalDataRaw.length > 0) {
    try {
      const parsedJson = JSON.parse(additionalDataRaw);
      if (!parsedJson || Array.isArray(parsedJson) || typeof parsedJson !== "object") {
        throw new Error("Dodatni podaci moraju biti JSON objekat.");
      }
      parsedAdditionalData = parsedJson as Record<string, unknown>;
    } catch {
      throw new Error("Dodatni podaci moraju biti validan JSON objekat.");
    }
  }

  return {
    tip_zapisa: form.tip_zapisa,
    opis,
    mikroservis: normalizeNullableString(form.mikroservis),
    korisnik_id: parsedKorisnikId,
    ip_adresa: normalizeNullableString(form.ip_adresa),
    dodatni_podaci: parsedAdditionalData,
  };
};

const parseFormToUpdatePayload = (form: AuditFormState): UpdateAuditLogDTO => {
  return parseFormToCreatePayload(form);
};

const toFormState = (log: AuditLogDTO): AuditFormState => {
  return {
    tip_zapisa: log.tip_zapisa,
    opis: log.opis,
    mikroservis: log.mikroservis ?? "",
    korisnik_id: log.korisnik_id?.toString() ?? "",
    ip_adresa: log.ip_adresa ?? "",
    dodatni_podaci: log.dodatni_podaci ? JSON.stringify(log.dodatni_podaci, null, 2) : "",
  };
};

const AuditLogsPage: React.FC = () => {
  const { token } = useAuth();
  const { auditAPI } = useServices();

  const [logs, setLogs] = useState<AuditLogDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [filters, setFilters] = useState<AuditFiltersState>(EMPTY_FILTERS);
  const [activeCriteria, setActiveCriteria] = useState<AuditLogSearchCriteriaDTO | null>(null);
  const [sortBy, setSortBy] = useState<AuditSortColumn>("datum_vreme");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESC");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<AuditFormMode>("create");
  const [editingLog, setEditingLog] = useState<AuditLogDTO | null>(null);
  const [formState, setFormState] = useState<AuditFormState>(EMPTY_FORM);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<AuditLogDTO | null>(null);

  const loadLogs = useCallback(
    async (criteria: AuditLogSearchCriteriaDTO | null) => {
      if (!token) {
        setLogs([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const shouldUseSearch = hasCriteria(criteria);
        const response = shouldUseSearch
          ? await auditAPI.searchLogs(criteria ?? {}, token)
          : await auditAPI.getAllLogs(token);

        setLogs(response);
        setActiveCriteria(shouldUseSearch ? criteria : null);
      } catch (requestError) {
        console.error(requestError);
        setError("Greska pri ucitavanju audit evidencije.");
      } finally {
        setIsLoading(false);
      }
    },
    [auditAPI, token]
  );

  useEffect(() => {
    void loadLogs(null);
  }, [loadLogs]);

  const sortedLogs = useMemo(() => {
    const ordered = [...logs].sort((first, second) => {
      let comparison = 0;

      switch (sortBy) {
        case "id":
          comparison = compareNumbers(first.id, second.id);
          break;
        case "datum_vreme":
          comparison = compareNumbers(
            new Date(first.datum_vreme).getTime(),
            new Date(second.datum_vreme).getTime()
          );
          break;
        case "tip_zapisa":
          comparison = compareStrings(first.tip_zapisa, second.tip_zapisa);
          break;
        case "mikroservis":
          comparison = compareNullableStrings(first.mikroservis, second.mikroservis);
          break;
        case "korisnik_id":
          comparison = compareNullableNumbers(first.korisnik_id, second.korisnik_id);
          break;
        case "ip_adresa":
          comparison = compareNullableStrings(first.ip_adresa, second.ip_adresa);
          break;
        case "opis":
          comparison = compareStrings(first.opis, second.opis);
          break;
        case "dodatni_podaci":
          comparison = compareNullableStrings(
            first.dodatni_podaci ? JSON.stringify(first.dodatni_podaci) : "",
            second.dodatni_podaci ? JSON.stringify(second.dodatni_podaci) : ""
          );
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "ASC" ? comparison : -comparison;
    });

    return ordered;
  }, [logs, sortBy, sortDirection]);

  const stats = useMemo(() => {
    const infoCount = logs.filter((entry) => entry.tip_zapisa === AuditLogLevel.INFO).length;
    const warningCount = logs.filter((entry) => entry.tip_zapisa === AuditLogLevel.WARNING).length;
    const errorCount = logs.filter((entry) => entry.tip_zapisa === AuditLogLevel.ERROR).length;

    return {
      total: logs.length,
      info: infoCount,
      warning: warningCount,
      error: errorCount,
    };
  }, [logs]);

  const handleApplyFilters = async (): Promise<void> => {
    setSuccess(null);
    try {
      const criteria = parseFiltersToCriteria(filters);
      await loadLogs(criteria);
    } catch (validationError) {
      setError((validationError as Error).message);
    }
  };

  const handleResetFilters = async (): Promise<void> => {
    setFilters(EMPTY_FILTERS);
    setSuccess(null);
    await loadLogs(null);
  };

  const handleRefresh = async (): Promise<void> => {
    setSuccess(null);
    await loadLogs(activeCriteria);
  };

  const handleSort = (column: AuditSortColumn): void => {
    if (sortBy === column) {
      setSortDirection((previous) => (previous === "ASC" ? "DESC" : "ASC"));
      return;
    }

    setSortBy(column);
    setSortDirection("ASC");
  };

  const renderSortIcon = (column: AuditSortColumn): React.ReactNode => {
    if (sortBy !== column) {
      return <ArrowUpDown size={14} className="text-muted" />;
    }

    return sortDirection === "ASC" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const openCreateModal = (): void => {
    setFormMode("create");
    setEditingLog(null);
    setFormState(EMPTY_FORM);
    setError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (log: AuditLogDTO): void => {
    setFormMode("edit");
    setEditingLog(log);
    setFormState(toFormState(log));
    setError(null);
    setIsFormOpen(true);
  };

  const closeFormModal = (): void => {
    if (isSaving) {
      return;
    }
    setIsFormOpen(false);
    setEditingLog(null);
    setFormState(EMPTY_FORM);
  };

  const updateFormField = <T extends keyof AuditFormState>(key: T, value: AuditFormState[T]): void => {
    setFormState((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSaveLog = async (): Promise<void> => {
    if (!token) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (formMode === "create") {
        const payload = parseFormToCreatePayload(formState);
        await auditAPI.createLog(payload, token);
        setSuccess("Audit log je uspesno kreiran.");
      } else if (editingLog) {
        const payload = parseFormToUpdatePayload(formState);
        await auditAPI.updateLog(editingLog.id, payload, token);
        setSuccess("Audit log je uspesno azuriran.");
      }

      setIsFormOpen(false);
      setEditingLog(null);
      setFormState(EMPTY_FORM);
      await loadLogs(activeCriteria);
    } catch (requestError) {
      console.error(requestError);
      setError((requestError as Error).message || "Neuspesno cuvanje audit log zapisa.");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (log: AuditLogDTO): void => {
    setLogToDelete(log);
    setIsDeleteOpen(true);
    setError(null);
  };

  const closeDeleteModal = (): void => {
    if (isSaving) {
      return;
    }
    setIsDeleteOpen(false);
    setLogToDelete(null);
  };

  const handleDeleteLog = async (): Promise<void> => {
    if (!token || !logToDelete) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await auditAPI.deleteLog(logToDelete.id, token);
      setSuccess("Audit log je uspesno obrisan.");
      setIsDeleteOpen(false);
      setLogToDelete(null);
      await loadLogs(activeCriteria);
    } catch (requestError) {
      console.error(requestError);
      setError("Neuspesno brisanje audit log zapisa.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="audit-page">
      <div className="page-header page-header--with-action">
        <div>
          <h1 className="page-header__title">Evidencija dogadjaja</h1>
          <p className="page-header__subtitle">Administracija i pregled audit log zapisa sistema</p>
        </div>
        <div className="audit-header-actions">
          <button className="btn btn--outline" onClick={() => void handleRefresh()} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? "icon-spin" : ""} />
            Osvezi
          </button>
          <button className="btn btn--primary" onClick={openCreateModal}>
            <Plus size={16} />
            Novi zapis
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard icon={<FileText size={24} />} value={stats.total} label="Ukupno zapisa" />
        <div className="audit-stat audit-stat--info">
          <StatsCard icon={<AlertTriangle size={24} />} value={stats.info} label="INFO zapisi" />
        </div>
        <div className="audit-stat audit-stat--warning">
          <StatsCard icon={<AlertTriangle size={24} />} value={stats.warning} label="WARNING zapisi" />
        </div>
        <div className="audit-stat audit-stat--error">
          <StatsCard icon={<AlertTriangle size={24} />} value={stats.error} label="ERROR zapisi" />
        </div>
      </div>

      {error && <div className="storage-alert storage-alert--error">{error}</div>}
      {success && <div className="storage-alert storage-alert--success">{success}</div>}

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">
            <Filter size={20} className="card__title-icon" />
            Pretraga i filteri
          </h2>
          <button className="btn btn--ghost btn--sm" onClick={() => void handleResetFilters()}>
            Resetuj
          </button>
        </div>
        <div className="card__body">
          <div className="audit-filters-grid">
            <div className="input-group">
              <label className="input-group__label">Tip zapisa</label>
              <select
                className="input select"
                value={filters.tip_zapisa}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    tip_zapisa: event.target.value as AuditFiltersState["tip_zapisa"],
                  }))
                }
              >
                <option value="">Svi tipovi</option>
                <option value={AuditLogLevel.INFO}>INFO</option>
                <option value={AuditLogLevel.WARNING}>WARNING</option>
                <option value={AuditLogLevel.ERROR}>ERROR</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-group__label">Mikroservis</label>
              <input
                className="input"
                value={filters.mikroservis}
                onChange={(event) =>
                  setFilters((previous) => ({ ...previous, mikroservis: event.target.value }))
                }
                placeholder="npr. sales-microservice"
              />
            </div>

            <div className="input-group">
              <label className="input-group__label">Opis (sadrzi)</label>
              <input
                className="input"
                value={filters.opis}
                onChange={(event) => setFilters((previous) => ({ ...previous, opis: event.target.value }))}
                placeholder="Tekst opisa"
              />
            </div>

            <div className="input-group">
              <label className="input-group__label">Korisnik ID</label>
              <input
                className="input"
                value={filters.korisnik_id}
                onChange={(event) =>
                  setFilters((previous) => ({ ...previous, korisnik_id: event.target.value }))
                }
                placeholder="npr. 2"
              />
            </div>

            <div className="input-group">
              <label className="input-group__label">IP adresa</label>
              <input
                className="input"
                value={filters.ip_adresa}
                onChange={(event) =>
                  setFilters((previous) => ({ ...previous, ip_adresa: event.target.value }))
                }
                placeholder="npr. 192.168.1.11"
              />
            </div>

            <div className="input-group">
              <label className="input-group__label">Datum od</label>
              <input
                className="input"
                type="date"
                value={filters.datum_od}
                onChange={(event) => setFilters((previous) => ({ ...previous, datum_od: event.target.value }))}
              />
            </div>

            <div className="input-group">
              <label className="input-group__label">Datum do</label>
              <input
                className="input"
                type="date"
                value={filters.datum_do}
                onChange={(event) => setFilters((previous) => ({ ...previous, datum_do: event.target.value }))}
              />
            </div>

            <div className="audit-filter-actions">
              <button className="btn btn--secondary" onClick={() => void handleApplyFilters()} disabled={isLoading}>
                <Search size={16} />
                Primeni filtere
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">
            <FileText size={20} className="card__title-icon" />
            Audit zapisi
          </h2>
        </div>
        <div className="card__body">
          <div className="table-container">
            <table className="table audit-table">
              <thead>
                <tr>
                  <th>
                    <button className="audit-table__sort-button" type="button" onClick={() => handleSort("id")}>
                      <span>ID</span>
                      {renderSortIcon("id")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="audit-table__sort-button"
                      type="button"
                      onClick={() => handleSort("datum_vreme")}
                    >
                      <span>Datum i vreme</span>
                      {renderSortIcon("datum_vreme")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="audit-table__sort-button"
                      type="button"
                      onClick={() => handleSort("tip_zapisa")}
                    >
                      <span>Tip</span>
                      {renderSortIcon("tip_zapisa")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="audit-table__sort-button"
                      type="button"
                      onClick={() => handleSort("mikroservis")}
                    >
                      <span>Mikroservis</span>
                      {renderSortIcon("mikroservis")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="audit-table__sort-button"
                      type="button"
                      onClick={() => handleSort("korisnik_id")}
                    >
                      <span>Korisnik ID</span>
                      {renderSortIcon("korisnik_id")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="audit-table__sort-button"
                      type="button"
                      onClick={() => handleSort("ip_adresa")}
                    >
                      <span>IP adresa</span>
                      {renderSortIcon("ip_adresa")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="audit-table__sort-button"
                      type="button"
                      onClick={() => handleSort("opis")}
                    >
                      <span>Opis</span>
                      {renderSortIcon("opis")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="audit-table__sort-button"
                      type="button"
                      onClick={() => handleSort("dodatni_podaci")}
                    >
                      <span>Dodatni podaci</span>
                      {renderSortIcon("dodatni_podaci")}
                    </button>
                  </th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <div className="spinner" />
                        <p className="mt-md text-muted">Ucitavanje zapisa...</p>
                      </div>
                    </td>
                  </tr>
                ) : sortedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <p className="text-muted">Nema zapisa za izabrane kriterijume.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{formatDateTime(log.datum_vreme)}</td>
                      <td>
                        <span className={badgeClassByLevel[log.tip_zapisa]}>
                          {levelLabelByType[log.tip_zapisa]}
                        </span>
                      </td>
                      <td>
                        <div className="audit-cell-truncate" title={log.mikroservis ?? "-"}>
                          {log.mikroservis ?? "-"}
                        </div>
                      </td>
                      <td>{log.korisnik_id ?? "-"}</td>
                      <td>{log.ip_adresa ?? "-"}</td>
                      <td>
                        <div className="audit-cell-truncate" title={log.opis}>
                          {log.opis}
                        </div>
                      </td>
                      <td>
                        <div
                          className="audit-cell-truncate"
                          title={
                            log.dodatni_podaci ? JSON.stringify(log.dodatni_podaci) : "Nema dodatnih podataka"
                          }
                        >
                          {log.dodatni_podaci ? JSON.stringify(log.dodatni_podaci) : "-"}
                        </div>
                      </td>
                      <td>
                        <div className="audit-table-actions">
                          <button className="btn btn--ghost btn--icon btn--sm" onClick={() => openEditModal(log)}>
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn--ghost btn--icon btn--sm"
                            onClick={() => openDeleteModal(log)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card__footer">
          <span className="text-muted" style={{ fontSize: "var(--font-size-sm)" }}>
            Prikazano {sortedLogs.length} zapisa
          </span>
        </div>
      </div>

      {isFormOpen && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div className="modal audit-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">
                {formMode === "create" ? "Novi audit zapis" : `Izmena zapisa #${editingLog?.id ?? ""}`}
              </h2>
              <button className="btn btn--ghost btn--icon" onClick={closeFormModal} disabled={isSaving}>
                x
              </button>
            </div>

            <div className="modal__body">
              <div className="audit-form-grid">
                <div className="input-group">
                  <label className="input-group__label">Tip zapisa</label>
                  <select
                    className="input select"
                    value={formState.tip_zapisa}
                    onChange={(event) =>
                      updateFormField("tip_zapisa", event.target.value as AuditLogLevel)
                    }
                  >
                    <option value={AuditLogLevel.INFO}>INFO</option>
                    <option value={AuditLogLevel.WARNING}>WARNING</option>
                    <option value={AuditLogLevel.ERROR}>ERROR</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-group__label">Mikroservis</label>
                  <input
                    className="input"
                    value={formState.mikroservis}
                    onChange={(event) => updateFormField("mikroservis", event.target.value)}
                    placeholder="npr. sales-microservice"
                  />
                </div>

                <div className="input-group">
                  <label className="input-group__label">Korisnik ID</label>
                  <input
                    className="input"
                    value={formState.korisnik_id}
                    onChange={(event) => updateFormField("korisnik_id", event.target.value)}
                    placeholder="npr. 3"
                  />
                </div>

                <div className="input-group">
                  <label className="input-group__label">IP adresa</label>
                  <input
                    className="input"
                    value={formState.ip_adresa}
                    onChange={(event) => updateFormField("ip_adresa", event.target.value)}
                    placeholder="npr. 192.168.1.10"
                  />
                </div>

                <div className="input-group audit-form-grid__full">
                  <label className="input-group__label">Opis *</label>
                  <textarea
                    className="input audit-textarea"
                    value={formState.opis}
                    onChange={(event) => updateFormField("opis", event.target.value)}
                    placeholder="Unesite opis dogadjaja"
                  />
                </div>

                <div className="input-group audit-form-grid__full">
                  <label className="input-group__label">Dodatni podaci (JSON objekat)</label>
                  <textarea
                    className="input audit-textarea audit-textarea--code"
                    value={formState.dodatni_podaci}
                    onChange={(event) => updateFormField("dodatni_podaci", event.target.value)}
                    placeholder='npr. {"billNumber":"FR-2026-001","total":12900}'
                  />
                </div>
              </div>
            </div>

            <div className="modal__footer">
              <button className="btn btn--outline" onClick={closeFormModal} disabled={isSaving}>
                Otkazi
              </button>
              <button className="btn btn--primary" onClick={() => void handleSaveLog()} disabled={isSaving}>
                {isSaving ? "Cuvanje..." : "Sacuvaj"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onConfirm={() => void handleDeleteLog()}
        title="Brisanje audit zapisa"
        message={`Da li ste sigurni da zelite da obrisete zapis #${logToDelete?.id ?? ""}?`}
        confirmText="Obrisi"
        cancelText="Otkazi"
        isLoading={isSaving}
        variant="danger"
      />
    </div>
  );
};

export default AuditLogsPage;
