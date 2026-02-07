import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Clock3, Package, PackageCheck, RefreshCw, Send, Truck, Warehouse } from "lucide-react";
import { useAuth } from "../hooks/useAuthHook";
import { useServices } from "../contexts/ServiceContext";
import { OverviewDTO } from "../models/storage/OverviewDTO";
import PackagingStorageTable from "../components/storage/PackagingStorageTable";
import WarehousesColumn from "../components/storage/WarehousesColumn";
import StatsCard from "../components/production/StatsCard";

type ActionMessage = {
    type: "success" | "warning" | "error";
    text: string;
};

const StoragePage: React.FC = () => {
    const { token } = useAuth();
    const { storageAPI } = useServices();

    const [data, setData] = useState<OverviewDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
    const [quantityInput, setQuantityInput] = useState("1");

    const loadData = useCallback(
        async (showLoader = true): Promise<void> => {
            if (!token) {
                setError("Niste ulogovani!");
                setData(null);
                setIsLoading(false);
                return;
            }

            if (showLoader) {
                setIsLoading(true);
            }

            setError(null);

            try {
                const response = await storageAPI.getOverview(token);
                setData(response);
            } catch (err: unknown) {
                const message =
                    err &&
                    typeof err === "object" &&
                    "response" in err &&
                    (err as { response?: { data?: { message?: string } } }).response?.data?.message
                        ? (err as { response: { data: { message: string } } }).response.data.message
                        : "Greska prilikom ucitavanja podataka o skladistu.";

                setError(message);
            } finally {
                if (showLoader) {
                    setIsLoading(false);
                }
            }
        },
        [storageAPI, token]
    );

    const packageStats = useMemo(() => {
        const stats = {
            spakovana: 0,
            rezervisana: 0,
            poslata: 0,
            raspakovana: 0,
        };

        for (const packaging of data?.packages ?? []) {
            switch (packaging.status) {
                case "spakovana":
                    stats.spakovana += 1;
                    break;
                case "rezervisana":
                    stats.rezervisana += 1;
                    break;
                case "poslata":
                    stats.poslata += 1;
                    break;
                case "raspakovana":
                    stats.raspakovana += 1;
                    break;
                default:
                    break;
            }
        }

        return stats;
    }, [data]);

    const parseQuantity = (): number | null => {
        const quantity = Number(quantityInput);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return null;
        }

        return quantity;
    };

    const sendPackages = async (): Promise<void> => {
        if (!token) {
            setError("Niste ulogovani!");
            return;
        }

        const quantity = parseQuantity();
        if (!quantity) {
            setActionMessage({
                type: "error",
                text: "Kolicina mora biti pozitivan ceo broj.",
            });
            return;
        }

        setIsSending(true);
        setActionMessage(null);
        setError(null);

        try {
            const result = await storageAPI.sendPackage({ quantity }, token);
            const sentPackages = Number(result?.sentPackages ?? 0);
            const isComplete = sentPackages === quantity;

            setActionMessage({
                type: isComplete ? "success" : "warning",
                text: isComplete
                    ? `Uspesno je poslato ${sentPackages} ambalaza.`
                    : `Poslato je ${sentPackages}/${quantity} trazenih ambalaza.`,
            });

            await loadData(false);
        } catch (err: unknown) {
            const message =
                err &&
                typeof err === "object" &&
                "response" in err &&
                (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    ? (err as { response: { data: { message: string } } }).response.data.message
                    : "Greska pri slanju ambalaze.";

            setActionMessage({
                type: "error",
                text: message,
            });
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, [loadData]);

    if (isLoading && !data) {
        return (
            <div className="main-content">
                <div className="empty-state">
                    <div className="spinner" />
                    <p className="mt-md text-muted">Ucitavanje podataka o skladistu...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="main-content">
                <div className="empty-state">
                    <h3 className="empty-state__title">Nije moguce ucitati skladiste</h3>
                    <p className="empty-state__description">
                        {error ?? "Podaci nisu dostupni."}
                    </p>
                    <button className="btn btn--primary mt-md" onClick={() => void loadData()}>
                        Pokusaj ponovo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content storage-page">
            <div className="page-header page-header--with-action">
                <div>
                    <h1 className="page-header__title">Skladistenje</h1>
                    <p className="page-header__subtitle">
                        Distributivni i magacinski centar ambalaze
                    </p>
                </div>

                <div className="storage-toolbar">
                    <div className="input-group storage-toolbar__quantity">
                        <label className="input-group__label">Kolicina za slanje</label>
                        <input
                            className="input"
                            type="number"
                            min={1}
                            step={1}
                            value={quantityInput}
                            onChange={(event) => setQuantityInput(event.target.value)}
                        />
                    </div>

                    <button
                        className="btn btn--primary"
                        onClick={() => void sendPackages()}
                        disabled={isSending || isLoading}
                    >
                        <Send size={16} />
                        {isSending ? "Slanje..." : "Posalji"}
                    </button>

                    <button
                        className="btn btn--secondary"
                        onClick={() => void loadData()}
                        disabled={isSending || isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? "icon-spin" : ""} />
                        {isLoading ? "Osvezavanje..." : "Osvezi"}
                    </button>
                </div>
            </div>

            {(actionMessage || error) && (
                <div
                    className={`storage-alert ${
                        actionMessage
                            ? `storage-alert--${actionMessage.type}`
                            : "storage-alert--error"
                    }`}
                >
                    {actionMessage?.text ?? error}
                </div>
            )}

            <div className="stats-grid">
                <div className="storage-stat storage-stat--packed">
                    <StatsCard
                        icon={<Archive size={24} />}
                        value={packageStats.spakovana}
                        label="Spakovane"
                    />
                </div>
                <div className="storage-stat storage-stat--reserved">
                    <StatsCard
                        icon={<Clock3 size={24} />}
                        value={packageStats.rezervisana}
                        label="Rezervisane"
                    />
                </div>
                <div className="storage-stat storage-stat--sent">
                    <StatsCard
                        icon={<Truck size={24} />}
                        value={packageStats.poslata}
                        label="Poslate"
                    />
                </div>
                <div className="storage-stat storage-stat--unpacked">
                    <StatsCard
                        icon={<PackageCheck size={24} />}
                        value={packageStats.raspakovana}
                        label="Raspakovane"
                    />
                </div>
            </div>

            <div className="grid grid--storage">
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">
                            <Warehouse size={20} className="card__title-icon" />
                            Skladista
                        </h2>
                    </div>
                    <div className="card__body">
                        <WarehousesColumn warehouses={data.warehouses} />
                    </div>
                </div>

                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">
                            <Package size={20} className="card__title-icon" />
                            Ambalaze
                        </h2>
                    </div>
                    <div className="card__body">
                        <PackagingStorageTable packages={data.packages} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoragePage;
