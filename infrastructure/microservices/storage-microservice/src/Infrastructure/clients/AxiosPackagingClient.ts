import axios, { AxiosInstance } from "axios";
import {
  EnsureAvailablePackagesResultDTO,
  IPackagingClient,
} from "../../Domain/services/IPackagingClient";

type EnsureAvailablePayload = {
  success?: boolean;
  data?: EnsureAvailablePackagesResultDTO;
};

export class AxiosPackagingClient implements IPackagingClient {
  private readonly http: AxiosInstance;

  constructor(baseURL: string, gatewayKey: string) {
    this.http = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "X-Gateway-Key": gatewayKey,
      },
      timeout: 5000,
    });
  }

  async ensureAvailablePackages(quantity: number): Promise<EnsureAvailablePackagesResultDTO> {
    const response = await this.http.post<EnsureAvailablePayload>(
      "/packaging/ensure-available",
      { quantity }
    );

    const payload = response.data?.data ?? (response.data as unknown as EnsureAvailablePackagesResultDTO);
    if (!payload || typeof payload !== "object") {
      throw new Error("Pakovanje nije vratilo validan odgovor za dopunu ambalaze.");
    }

    const requestedQuantity = Number(payload.requestedQuantity);
    const availableBefore = Number(payload.availableBefore);
    const availableAfter = Number(payload.availableAfter);
    const createdPackages = Number(payload.createdPackages);

    if (
      !Number.isFinite(requestedQuantity) ||
      !Number.isFinite(availableBefore) ||
      !Number.isFinite(availableAfter) ||
      !Number.isFinite(createdPackages)
    ) {
      throw new Error("Nevalidan odgovor pakovanja pri dopuni ambalaze.");
    }

    return {
      requestedQuantity,
      availableBefore,
      availableAfter,
      createdPackages,
    };
  }
}
