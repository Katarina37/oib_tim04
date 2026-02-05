import axios, { AxiosInstance } from "axios";
import { IStorageClient } from "Domain/services/IStorageClient";

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

    async sendPackages(quantity: number) : Promise<number> {
        const response = await this.http.post<{ sent: number } >(
            "/storage/send",
            { quantity }
        );
        return response.data.sent;
    }

    async getInventory(): Promise<any> {
        // Gađamo tvoju novu rutu u Storage mikroservisu
        const response = await this.http.get("/storage/available");
        return response.data; // Vraća { distributiveCenter, warehouseCenter }
    }
}