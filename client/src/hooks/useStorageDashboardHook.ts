import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuthHook";
import { useServices } from "../contexts/ServiceContext";
import { OverviewDTO } from "../models/storage/OverviewDTO";
import { StorageBottleVolume, StoragePerfumeType } from "../models/storage/PackagePerfumesDTO";

export type ActionMessage = {
    type: "success" | "warning" | "error";
    text: string;
};

type ApiErrorPayload = {
    response?: {
        data?: {
            message?: string;
            error?: string;
        };
    };
    message?: string;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (!error || typeof error !== "object") {
        return fallback;
    }

    const payload = error as ApiErrorPayload;
    return payload.response?.data?.message ?? payload.response?.data?.error ?? payload.message ?? fallback;
};

const parsePositiveInteger = (value: string): number | null => {
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity <= 0) {
        return null;
    }

    return quantity;
};

const parsePackageIds = (raw: string): number[] => {
    const unique = new Set<number>();

    for (const token of raw.split(",")) {
        const value = Number(token.trim());
        if (Number.isInteger(value) && value > 0) {
            unique.add(value);
        }
    }

    return [...unique];
};

export const useStorageDashboard = () => {
    const { token } = useAuth();
    const { storageAPI } = useServices();

    const [data, setData] = useState<OverviewDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isPackaging, setIsPackaging] = useState(false);
    const [isMovingToWarehouse, setIsMovingToWarehouse] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);

    const [sendQuantityInput, setSendQuantityInput] = useState("1");
    const [packQuantityInput, setPackQuantityInput] = useState("1");
    const [perfumeName, setPerfumeName] = useState("");
    const [perfumeType, setPerfumeType] = useState<"" | StoragePerfumeType>("");
    const [bottleVolume, setBottleVolume] = useState<"" | "150" | "250">("");
    const [targetWarehouseId, setTargetWarehouseId] = useState("");
    const [packageIdsInput, setPackageIdsInput] = useState("");

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
                setTargetWarehouseId((current) => current || response.warehouses[0]?.id?.toString() || "");
            } catch (err: unknown) {
                setError(getErrorMessage(err, "Greska prilikom ucitavanja podataka o skladistu."));
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

        for (const packageInfo of data?.packages ?? []) {
            switch (packageInfo.status) {
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

    const packagePerfumes = useCallback(async (): Promise<void> => {
        if (!token) {
            setError("Niste ulogovani!");
            return;
        }

        const quantity = parsePositiveInteger(packQuantityInput);
        if (!quantity) {
            setActionMessage({
                type: "error",
                text: "Kolicina za pakovanje mora biti pozitivan ceo broj.",
            });
            return;
        }

        const parsedWarehouseId = Number(targetWarehouseId);
        if (!Number.isInteger(parsedWarehouseId) || parsedWarehouseId <= 0) {
            setActionMessage({
                type: "error",
                text: "Izaberite ciljno skladiste.",
            });
            return;
        }

        setIsPackaging(true);
        setActionMessage(null);
        setError(null);

        try {
            const result = await storageAPI.packagePerfumes(
                {
                    quantity,
                    targetWarehouseId: parsedWarehouseId,
                    perfumeName: perfumeName.trim() || undefined,
                    perfumeType: perfumeType || undefined,
                    bottleVolumeMl: bottleVolume ? (Number(bottleVolume) as StorageBottleVolume) : undefined,
                },
                token
            );

            const isComplete = result.packagedQuantity === result.requestedQuantity;
            setActionMessage({
                type: isComplete ? "success" : "warning",
                text: isComplete
                    ? `Uspesno je spakovano ${result.packagedQuantity} parfema.`
                    : `Spakovano je ${result.packagedQuantity}/${result.requestedQuantity} parfema.`,
            });

            if (result.packageIds.length > 0) {
                setPackageIdsInput(result.packageIds.join(", "));
            }

            await loadData(false);
        } catch (err: unknown) {
            setActionMessage({
                type: "error",
                text: getErrorMessage(err, "Greska pri pakovanju parfema."),
            });
        } finally {
            setIsPackaging(false);
        }
    }, [
        bottleVolume,
        loadData,
        packQuantityInput,
        perfumeName,
        perfumeType,
        storageAPI,
        targetWarehouseId,
        token,
    ]);

    const sendToWarehouse = useCallback(async (): Promise<void> => {
        if (!token) {
            setError("Niste ulogovani!");
            return;
        }

        const parsedWarehouseId = Number(targetWarehouseId);
        if (!Number.isInteger(parsedWarehouseId) || parsedWarehouseId <= 0) {
            setActionMessage({
                type: "error",
                text: "Izaberite ciljno skladiste.",
            });
            return;
        }

        const packageIds = parsePackageIds(packageIdsInput);
        if (packageIds.length === 0) {
            setActionMessage({
                type: "error",
                text: "Unesite barem jedan validan ID paketa.",
            });
            return;
        }

        setIsMovingToWarehouse(true);
        setActionMessage(null);
        setError(null);

        try {
            const result = await storageAPI.sendToWarehouse(
                {
                    packageIds,
                    targetWarehouseId: parsedWarehouseId,
                },
                token
            );

            const isComplete = result.movedPackages === result.requestedPackages;
            setActionMessage({
                type: isComplete ? "success" : "warning",
                text: isComplete
                    ? `Uspesno je prebaceno ${result.movedPackages} paketa u skladiste.`
                    : `Prebaceno je ${result.movedPackages}/${result.requestedPackages} paketa.`,
            });

            setPackageIdsInput(result.movedPackageIds.join(", "));
            await loadData(false);
        } catch (err: unknown) {
            setActionMessage({
                type: "error",
                text: getErrorMessage(err, "Greska pri prebacivanju paketa u skladiste."),
            });
        } finally {
            setIsMovingToWarehouse(false);
        }
    }, [loadData, packageIdsInput, storageAPI, targetWarehouseId, token]);

    const sendPackages = useCallback(async (): Promise<void> => {
        if (!token) {
            setError("Niste ulogovani!");
            return;
        }

        const quantity = parsePositiveInteger(sendQuantityInput);
        if (!quantity) {
            setActionMessage({
                type: "error",
                text: "Kolicina za slanje mora biti pozitivan ceo broj.",
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
                    ? `Uspesno je poslato ${sentPackages} ambalaza iz skladista.`
                    : `Poslato je ${sentPackages}/${quantity} trazenih ambalaza.`,
            });

            await loadData(false);
        } catch (err: unknown) {
            setActionMessage({
                type: "error",
                text: getErrorMessage(err, "Greska pri slanju ambalaze iz skladista."),
            });
        } finally {
            setIsSending(false);
        }
    }, [loadData, sendQuantityInput, storageAPI, token]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    return {
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
    };
};
