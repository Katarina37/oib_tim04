import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuthHook";
import { useServices } from "../contexts/ServiceContext";
import { OverviewDTO } from "../models/storage/OverviewDTO";

import PackagingStorageTable from "../components/storage/PackagingStorageTable";
import WarehousesColumn from "../components/storage/WarehousesColumn";

const StoragePage: React.FC = () => {
    const { token } = useAuth();
    const { storageAPI } = useServices();

    const [data, setData] = useState<OverviewDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        if (!token) {
            setError("Niste ulogovani!");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await storageAPI.getOverview(token);
            setData(response);
        } catch (err: any) {
            console.error("STORAGE API ERROR:", err);
            setError(err?.response?.data?.message || "Greska prilikom ucitavanja.");
        } finally {
            setIsLoading(false);
        }
    };

    const sendPackages = async () => {
        if (!token) {
            setError("Niste ulogovani!");
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            await storageAPI.sendPackage({ quantity: 1 }, token);
            await loadData();
        } catch (err: any) {
            setError(err?.message || "Greska pri slanju paketa");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    if (isLoading) return <div className="main-content">Ucitavanje...</div>;
    if (error) return <div className="main-content text-error">{error}</div>;
    if (!data) return <div className="main-content">Nema podataka</div>;

    return (
        <div className="main-content">
            {/* Header */}
            <div className="page-header page-header--with-action">
                <div>
                    <h1 className="page-header__title">Skladistenje</h1>
                    <p className="page-header__subtitle">
                        Pregled skladista i ambalaza
                    </p>
                </div>

                <div className="flex gap-md">
                    <button
                        className="btn btn--primary"
                        onClick={sendPackages}
                        disabled={isLoading}
                    >
                        Posalji
                    </button>

                    <button
                        className="btn btn--secondary"
                        onClick={loadData}
                        disabled={isLoading}
                    >
                        {isLoading ? "Osvezavanje..." : "Osvezi"}
                    </button>
                </div>
            </div>

            {/* 2 columns */}
            <div className="grid grid--2">

                {/* Warehouses */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">Skladista</h2>
                    </div>

                    <div className="card__body">
                        <WarehousesColumn warehouses={data.warehouses} />
                    </div>
                </div>

                {/* Packages */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">Ambalaze</h2>
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
