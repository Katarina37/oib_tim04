import React, { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import {
  FlaskConical,
  RefreshCw,
  Beaker,
  Package,
  TestTubeDiagonal,
  PackageCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuthHook";
import { useServices } from "../contexts/ServiceContext";
import StatsCard from "../components/production/StatsCard";
import {
  BottleVolume,
  PerfumeDTO,
  PerfumeSearchCriteriaDTO,
  PerfumeType,
  ProcessingStatsDTO,
  ProcessingSummaryDTO,
  StartProcessingDTO,
} from "../models/processing/ProcessingDTO";

type ActionMessage = {
  type: "success" | "warning" | "error";
  text: string;
};

const initialStartForm: StartProcessingDTO = {
  perfumeName: "",
  perfumeType: PerfumeType.PERFUME,
  bottleQuantity: 1,
  bottleVolumeMl: BottleVolume.ML_150,
};

const initialFilters: PerfumeSearchCriteriaDTO = {
  sortBy: "createdAt",
  sortDirection: "DESC",
};

const formatDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("sr-RS");
};

const getTypeLabel = (type: PerfumeType): { label: string; className: string } => {
  if (type === PerfumeType.PERFUME) {
    return { label: "Parfem", className: "badge badge--sales-perfume" };
  }

  return { label: "Kolonjska voda", className: "badge badge--sales-cologne" };
};

const parseApiErrorMessage = (error: unknown): string | null => {
  if (isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return payload?.message ?? payload?.error ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return null;
};

const ProcessingPage: React.FC = () => {
  const { token } = useAuth();
  const { processingAPI } = useServices();

  const [perfumes, setPerfumes] = useState<PerfumeDTO[]>([]);
  const [stats, setStats] = useState<ProcessingStatsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);

  const [startForm, setStartForm] = useState<StartProcessingDTO>(initialStartForm);
  const [activeFilters, setActiveFilters] = useState<PerfumeSearchCriteriaDTO>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<PerfumeSearchCriteriaDTO>(initialFilters);

  const [lastProcessingResult, setLastProcessingResult] = useState<ProcessingSummaryDTO | null>(null);

  const loadData = useCallback(
    async (criteria: PerfumeSearchCriteriaDTO): Promise<void> => {
      if (!token) {
        setPerfumes([]);
        setStats(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [loadedPerfumes, loadedStats] = await Promise.all([
          processingAPI.getPerfumes(token, criteria),
          processingAPI.getStats(token),
        ]);

        setPerfumes(loadedPerfumes);
        setStats(loadedStats);
      } catch (requestError) {
        const message =
          parseApiErrorMessage(requestError) ??
          "Greska prilikom ucitavanja podataka prerade.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [processingAPI, token]
  );

  useEffect(() => {
    void loadData(activeFilters);
  }, [activeFilters, loadData]);

  const handleStartProcessing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setIsProcessing(true);
    setActionMessage(null);
    setError(null);

    try {
      const result = await processingAPI.startProcessing(startForm, token);
      setLastProcessingResult(result);
      setActionMessage({
        type: "success",
        text: `Prerada uspesna: kreirano ${result.createdPerfumes.length} parfema, utroseno ${result.requiredPlants} biljaka.`,
      });

      await loadData(activeFilters);
    } catch (requestError) {
      const message =
        parseApiErrorMessage(requestError) ?? "Neuspesno pokretanje prerade.";
      setActionMessage({ type: "error", text: message });
    } finally {
      setIsProcessing(false);
    }
  };

  const displayedStats = useMemo(
    () => ({
      totalPerfumes: stats?.totalPerfumes ?? 0,
      availableForPackaging: stats?.availableForPackaging ?? 0,
      perfumeCount: stats?.perfumeCount ?? 0,
      cologneCount: stats?.cologneCount ?? 0,
    }),
    [stats]
  );

  return (
    <div className="processing-page">
      <div className="page-header page-header--with-action">
        <div>
          <h1 className="page-header__title">Prerada sirovina</h1>
          <p className="page-header__subtitle">
            Pretvaranje ubranih biljaka u gotove parfeme za pakovanje
          </p>
        </div>
        <button
          className="btn btn--secondary"
          onClick={() => void loadData(activeFilters)}
          disabled={isLoading || isProcessing}
        >
          <RefreshCw size={16} className={isLoading ? "icon-spin" : ""} />
          {isLoading ? "Osvezavanje..." : "Osvezi"}
        </button>
      </div>

      {(actionMessage || error) && (
        <div
          className={`storage-alert ${
            actionMessage ? `storage-alert--${actionMessage.type}` : "storage-alert--error"
          }`}
        >
          {actionMessage?.text ?? error}
        </div>
      )}

      <div className="stats-grid">
        <StatsCard
          icon={<Package size={24} />}
          value={displayedStats.totalPerfumes}
          label="Ukupno parfema"
        />
        <StatsCard
          icon={<PackageCheck size={24} />}
          value={displayedStats.availableForPackaging}
          label="Dostupno za pakovanje"
        />
        <StatsCard
          icon={<Beaker size={24} />}
          value={displayedStats.perfumeCount}
          label="Parfemi"
        />
        <StatsCard
          icon={<TestTubeDiagonal size={24} />}
          value={displayedStats.cologneCount}
          label="Kolonjske vode"
        />
      </div>

      <div className="grid grid--processing">
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <FlaskConical size={20} className="card__title-icon" />
              Pregled parfema
            </h2>
          </div>
          <div className="card__body">
            <div className="processing-filters">
              <input
                className="input"
                placeholder="Naziv parfema"
                value={draftFilters.perfumeName ?? ""}
                onChange={(event) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    perfumeName: event.target.value,
                  }))
                }
              />

              <select
                className="input select"
                value={draftFilters.perfumeType ?? ""}
                onChange={(event) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    perfumeType: event.target.value
                      ? (event.target.value as PerfumeType)
                      : undefined,
                  }))
                }
              >
                <option value="">Svi tipovi</option>
                <option value={PerfumeType.PERFUME}>Parfem</option>
                <option value={PerfumeType.COLOGNE_WATER}>Kolonjska voda</option>
              </select>

              <select
                className="input select"
                value={draftFilters.bottleVolumeMl ?? ""}
                onChange={(event) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    bottleVolumeMl: event.target.value
                      ? (Number(event.target.value) as BottleVolume)
                      : undefined,
                  }))
                }
              >
                <option value="">Sve zapremine</option>
                <option value={BottleVolume.ML_150}>150 ml</option>
                <option value={BottleVolume.ML_250}>250 ml</option>
              </select>

              <label className="processing-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(draftFilters.onlyAvailableForPackaging)}
                  onChange={(event) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      onlyAvailableForPackaging: event.target.checked,
                    }))
                  }
                />
                Samo dostupni za pakovanje
              </label>

              <button
                className="btn btn--primary"
                onClick={() => setActiveFilters({ ...draftFilters, sortBy: "createdAt", sortDirection: "DESC" })}
              >
                Primeni filtere
              </button>

              <button
                className="btn btn--outline"
                onClick={() => {
                  setDraftFilters(initialFilters);
                  setActiveFilters(initialFilters);
                }}
              >
                Resetuj
              </button>
            </div>

            {isLoading ? (
              <div className="empty-state">
                <div className="spinner" />
                <p className="mt-md text-muted">Ucitavanje parfema...</p>
              </div>
            ) : perfumes.length === 0 ? (
              <div className="empty-state">
                <h3 className="empty-state__title">Nema parfema</h3>
                <p className="empty-state__description">
                  Trenutno ne postoje parfemi koji odgovaraju izabranim filterima.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table table--striped">
                  <thead>
                    <tr>
                      <th>Naziv</th>
                      <th>Tip</th>
                      <th>Zapremina</th>
                      <th>Serijski broj</th>
                      <th>Rok trajanja</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perfumes.map((perfume) => {
                      const typeBadge = getTypeLabel(perfume.type);

                      return (
                        <tr key={perfume.id}>
                          <td>{perfume.name}</td>
                          <td>
                            <span className={typeBadge.className}>{typeBadge.label}</span>
                          </td>
                          <td>{perfume.netVolumeMl} ml</td>
                          <td>{perfume.serialNumber}</td>
                          <td>{formatDate(perfume.expiryDate)}</td>
                          <td>
                            <span className={`badge ${perfume.isPackaged ? "badge--warning" : "badge--success"}`}>
                              {perfume.isPackaged ? "Spakovan" : "Dostupan"}
                            </span>
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

        <div className="processing-side-column">
          <div className="card">
            <div className="card__header">
              <h2 className="card__title">
                <Beaker size={20} className="card__title-icon" />
                Pokreni preradu
              </h2>
            </div>
            <form className="card__body processing-form" onSubmit={handleStartProcessing}>
              <div className="input-group">
                <label className="input-group__label">Naziv parfema</label>
                <input
                  className="input"
                  value={startForm.perfumeName}
                  onChange={(event) =>
                    setStartForm((prev) => ({ ...prev, perfumeName: event.target.value }))
                  }
                  placeholder="npr. Citrus Bloom"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-group__label">Tip</label>
                <select
                  className="input select"
                  value={startForm.perfumeType}
                  onChange={(event) =>
                    setStartForm((prev) => ({
                      ...prev,
                      perfumeType: event.target.value as PerfumeType,
                    }))
                  }
                >
                  <option value={PerfumeType.PERFUME}>Parfem</option>
                  <option value={PerfumeType.COLOGNE_WATER}>Kolonjska voda</option>
                </select>
              </div>

              <div className="processing-form__row">
                <div className="input-group">
                  <label className="input-group__label">Broj bočica</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    step={1}
                    value={startForm.bottleQuantity}
                    onChange={(event) =>
                      setStartForm((prev) => ({
                        ...prev,
                        bottleQuantity: Number(event.target.value) || 0,
                      }))
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-group__label">Neto zapremina</label>
                  <select
                    className="input select"
                    value={startForm.bottleVolumeMl}
                    onChange={(event) =>
                      setStartForm((prev) => ({
                        ...prev,
                        bottleVolumeMl: Number(event.target.value) as BottleVolume,
                      }))
                    }
                  >
                    <option value={BottleVolume.ML_150}>150 ml</option>
                    <option value={BottleVolume.ML_250}>250 ml</option>
                  </select>
                </div>
              </div>

              <button className="btn btn--primary" type="submit" disabled={isProcessing}>
                {isProcessing ? "Obrada..." : "Pokreni preradu"}
              </button>
            </form>

            {lastProcessingResult && (
              <div className="card__footer">
                <span className="text-muted" style={{ fontSize: "var(--font-size-sm)" }}>
                  Poslednja prerada: {lastProcessingResult.createdPerfumes.length} parfema,{" "}
                  {lastProcessingResult.requiredPlants} biljaka.
                </span>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card__header">
              <h2 className="card__title">
                <PackageCheck size={20} className="card__title-icon" />
                Tok pakovanja
              </h2>
            </div>
            <div className="card__body">
              <p className="text-muted">
                Preuzimanje parfema za ambalazu vodi se iskljucivo kroz mikroservis pakovanja.
              </p>
              <p className="text-muted mt-sm">
                Za sledeci korak koristi stranu <strong>Skladistenje</strong> i akcije{" "}
                <strong>Spakuj artikle</strong> i <strong>Posalji prvu dostupnu u skladiste</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;
