import { useAuth } from "../hooks/useAuthHook";
import { useServices } from "../contexts/ServiceContext";
import { OverviewDTO } from "../models/storage/OverviewDTO";
import { SendPackageDTO } from "../models/storage/SendPackageDTO";

export const useStorageService = () => {
    const { token } = useAuth();
    const { storageAPI } = useServices();

    const getOverview = async (): Promise<OverviewDTO | null> => {
        if (!token) return null;
        return await storageAPI.getOverview(token);
    };

    const sendPackages = async (quantity: number = 1): Promise<void> => {
        if (!token) throw new Error("User not authenticated");

        const dto: SendPackageDTO = { quantity }; 

        await storageAPI.sendPackage(dto, token);
    };

    return { getOverview, sendPackages };
};