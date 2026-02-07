import React from "react";
import { Archive, Clock3, Package, PackageCheck, RefreshCw, Send, Truck, Warehouse } from "lucide-react";
import PackagingStorageTable from "../components/storage/PackagingStorageTable";
import WarehousesColumn from "../components/storage/WarehousesColumn";
import StatsCard from "../components/production/StatsCard";
import { useStorageDashboard } from "../hooks/useStorageDashboardHook";

const StoragePage: React.FC = () => {
    const {
        data,
        isLoading,
        isSending,
        isPackaging,
        isMovingToWarehouse,
        error,
        actionMessage,
        sendQuantityInput,
        setSendQuantityInput,
        packQuantityInput,
        setPackQuantityInput,
        perfumeName,
        setPerfumeName,
        perfumeType,
        setPerfumeType,
        bottleVolume,
        setBottleVolume,
        targetWarehouseId,
        setTargetWarehouseId,
        packageIdsInput,
        setPackageIdsInput,
        packageStats,
        loadData,
        packagePerfumes,
        sendToWarehouse,
        sendPackages,
    } = useStorageDashboard();

    if (isLoading && !data) {
        return (
            <div className="storage-page">
                <div className="empty-state">
                    <div className="spinner" />
                    <p className="mt-md text-muted">Ucitavanje podataka o skladistu...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="storage-page">
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

    const hasWarehouses = data.warehouses.length > 0;
    const hasPendingActions = isSending || isPackaging || isMovingToWarehouse || isLoading;

    return (
        <div className="storage-page">
            <div className="page-header">
                <h1 className="page-header__title">Skladistenje</h1>
                <p className="page-header__subtitle">
                    Pakovanje, prijem i distribucija ambalaze
                </p>
            </div>

            <div className="card">
                <div className="card__header">
                    <h2 className="card__title">
                        <Package size={20} className="card__title-icon" />
                        Upravljanje paketima
                    </h2>
                    <button
                        className="btn btn--secondary"
                        onClick={() => void loadData()}
                        disabled={hasPendingActions}
                    >
                        <RefreshCw size={16} className={isLoading ? "icon-spin" : ""} />
                        {isLoading ? "Osvezavanje..." : "Osvezi"}
                    </button>
                </div>

                <div className="card__body">
                    <div className="storage-toolbar">
                        <div className="storage-toolbar__section">
                            <p className="storage-toolbar__title">Spakuj artikle</p>
                            <div className="storage-toolbar__row storage-toolbar__row--pack">
                                <div className="input-group storage-toolbar__quantity">
                                    <label className="input-group__label">Kolicina za pakovanje</label>
                                    <input
                                        className="input"
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={packQuantityInput}
                                        onChange={(event) => setPackQuantityInput(event.target.value)}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-group__label">Ciljno skladiste</label>
                                    <select
                                        className="input select"
                                        value={targetWarehouseId}
                                        onChange={(event) => setTargetWarehouseId(event.target.value)}
                                    >
                                        {hasWarehouses ? (
                                            data.warehouses.map((warehouse) => (
                                                <option key={warehouse.id} value={warehouse.id}>
                                                    {warehouse.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="">Nema dostupnih skladista</option>
                                        )}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-group__label">Tip parfema</label>
                                    <select
                                        className="input select"
                                        value={perfumeType}
                                        onChange={(event) => setPerfumeType(event.target.value as "" | "parfem" | "kolonjska_voda")}
                                    >
                                        <option value="">Svi tipovi</option>
                                        <option value="parfem">Parfem</option>
                                        <option value="kolonjska_voda">Kolonjska voda</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-group__label">Zapremina</label>
                                    <select
                                        className="input select"
                                        value={bottleVolume}
                                        onChange={(event) => setBottleVolume(event.target.value as "" | "150" | "250")}
                                    >
                                        <option value="">Sve</option>
                                        <option value="150">150 ml</option>
                                        <option value="250">250 ml</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-group__label">Naziv parfema</label>
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="npr. Rose Essence"
                                        value={perfumeName}
                                        onChange={(event) => setPerfumeName(event.target.value)}
                                    />
                                </div>

                                <button
                                    className="btn btn--primary storage-toolbar__action"
                                    onClick={() => void packagePerfumes()}
                                    disabled={hasPendingActions || !hasWarehouses}
                                >
                                    <Package size={16} />
                                    {isPackaging ? "Pakovanje..." : "Spakuj artikle"}
                                </button>
                            </div>
                        </div>

                        <div className="storage-toolbar__section">
                            <p className="storage-toolbar__title">Posalji iz skladista</p>
                            <div className="storage-toolbar__row storage-toolbar__row--send">
                                <div className="input-group storage-toolbar__quantity">
                                    <label className="input-group__label">Kolicina za slanje</label>
                                    <input
                                        className="input"
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={sendQuantityInput}
                                        onChange={(event) => setSendQuantityInput(event.target.value)}
                                    />
                                </div>

                                <button
                                    className="btn btn--primary storage-toolbar__action"
                                    onClick={() => void sendPackages()}
                                    disabled={hasPendingActions}
                                >
                                    <Send size={16} />
                                    {isSending ? "Slanje..." : "Posalji iz skladista"}
                                </button>
                            </div>
                        </div>

                        <div className="storage-toolbar__section">
                            <p className="storage-toolbar__title">Posalji u skladiste</p>
                            <div className="storage-toolbar__row storage-toolbar__row--warehouse">
                                <div className="input-group">
                                    <label className="input-group__label">ID paketa za prijem</label>
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="npr. 1, 2, 3"
                                        value={packageIdsInput}
                                        onChange={(event) => setPackageIdsInput(event.target.value)}
                                    />
                                </div>

                                <button
                                    className="btn btn--secondary storage-toolbar__action"
                                    onClick={() => void sendToWarehouse()}
                                    disabled={hasPendingActions || !hasWarehouses}
                                >
                                    <Warehouse size={16} />
                                    {isMovingToWarehouse ? "Prijem..." : "Posalji u skladiste"}
                                </button>
                            </div>
                        </div>
                    </div>
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
