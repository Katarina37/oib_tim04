import axios, { AxiosInstance } from "axios";
import { IStorageClient } from "../../Domain/services/IStorageClient";
import { UserContext } from "../../Domain/types/UserContext";

export class StorageClient implements IStorageClient {
    private readonly http: AxiosInstance;

    constructor(baseURL: string, gatewayKey: string) {
        this.http = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
                "X-Gateway-Key": gatewayKey
            }, 
            timeout: 5000
        });
    }

    private buildUserHeaders(userContext?: UserContext): Record<string, string> {
        if (!userContext) {
            return {};
        }

        return {
            "X-User-Id": String(userContext.id),
            "X-User-Role": userContext.role,
        };
    }

    async sendPackages(quantity: number, userContext?: UserContext): Promise<number> {
        const response = await this.http.post<{
            success?: boolean;
            data?: { sentPackages?: number };
            sent?: number;
            sentPackages?: number;
        }>(
            "/storage/send-package",
            { quantity },
            { headers: this.buildUserHeaders(userContext) }
        );

        const sentPackages =
            response.data?.data?.sentPackages ??
            response.data?.sentPackages ??
            response.data?.sent;

        if (typeof sentPackages !== "number") {
            throw new Error("Invalid response from storage service");
        }

        return sentPackages;
    }

    async getInventory(userContext?: UserContext): Promise<any> {
        // Gađamo tvoju novu rutu u Storage mikroservisu
        const response = await this.http.get("/storage/available", {
            headers: this.buildUserHeaders(userContext),
        });
        return response.data; // Vraća { distributiveCenter, warehouseCenter }
    }
}
