import { AxiosInstance, AxiosError } from "axios";
import {
  IMicroserviceClient,
  ProxyRequest,
  ProxyResponse,
} from "../../Domain/clients/IMicroserviceClient";

export class AxiosMicroserviceClient implements IMicroserviceClient {
  private authToken?: string;

  constructor(
    private readonly httpClient: AxiosInstance,
    private readonly gatewayApiKey: string
  ) {
    if (!gatewayApiKey) {
      throw new Error("GATEWAY_API_KEY is required for gateway → microservice calls");
    }
  }

  setAuthHeader(token: string): void {
    this.authToken = token;
  }

  private normalizeHeaders(headers: unknown): Record<string, string> {
    if (!headers || typeof headers !== "object") {
      return {};
    }

    const normalized: Record<string, string> = {};
    const rawHeaders = headers as Record<string, unknown>;

    for (const [key, value] of Object.entries(rawHeaders)) {
      if (typeof value === "string") {
        normalized[key.toLowerCase()] = value;
        continue;
      }

      if (Array.isArray(value)) {
        normalized[key.toLowerCase()] = value.join(", ");
      }
    }

    return normalized;
  }

  private toBuffer(data: unknown): Buffer {
    if (Buffer.isBuffer(data)) {
      return data;
    }

    if (data instanceof ArrayBuffer) {
      return Buffer.from(data);
    }

    if (ArrayBuffer.isView(data)) {
      return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    }

    if (typeof data === "string") {
      return Buffer.from(data, "binary");
    }

    return Buffer.from([]);
  }

  private resolveErrorMessage(error: AxiosError<{ message?: string }>): string {
    const payload: unknown = error.response?.data;

    if (
      payload &&
      typeof payload === "object" &&
      !Array.isArray(payload) &&
      "message" in payload &&
      typeof (payload as { message?: unknown }).message === "string"
    ) {
      return (payload as { message: string }).message;
    }

    if (typeof payload === "string" && payload.trim().length > 0) {
      return payload;
    }

    if (typeof error.message === "string" && error.message.trim().length > 0 && error.message !== "Error") {
      return error.message;
    }

    const code = typeof error.code === "string" ? error.code : "";
    const baseURL = typeof error.config?.baseURL === "string" ? error.config.baseURL : "";
    const url = typeof error.config?.url === "string" ? error.config.url : "";
    const target = `${baseURL}${url}`;

    if (code === "ECONNREFUSED") {
      return target
        ? `Mikroservis nije dostupan na adresi ${target}.`
        : "Mikroservis nije dostupan (ECONNREFUSED).";
    }

    if (code === "ETIMEDOUT" || code === "ECONNABORTED") {
      return target
        ? `Isteklo je vreme cekanja odgovora sa mikroservisa ${target}.`
        : "Isteklo je vreme cekanja odgovora mikroservisa.";
    }

    return code
      ? `Neuspesna komunikacija sa mikroservisom (${code}).`
      : "Neuspesna komunikacija sa mikroservisom.";
  }

  async proxy<T = unknown>(request: ProxyRequest): Promise<ProxyResponse<T>> {
    try {
      const headers: Record<string, string> = {
        "X-Gateway-Key": this.gatewayApiKey,
        ...(request.headers ?? {}),
      };

      if (this.authToken) {
        headers["Authorization"] = `Bearer ${this.authToken}`;
      }

      const acceptHeader = (request.headers?.Accept ?? request.headers?.accept ?? "").toLowerCase();
      const expectsPdf = acceptHeader.includes("application/pdf") || request.path.toLowerCase().endsWith("/pdf");

      const response = await this.httpClient.request<T | ArrayBuffer>({
        method: request.method,
        url: request.path,
        data: request.data,
        params: request.params,
        headers,
        responseType: expectsPdf ? "arraybuffer" : "json",
      });

      const responseData = expectsPdf ? this.toBuffer(response.data) : response.data;

      return {
        success: true,
        data: responseData as T,
        status: response.status,
        headers: this.normalizeHeaders(response.headers),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const fallbackStatus = axiosError.code === "ETIMEDOUT" || axiosError.code === "ECONNABORTED"
        ? 504
        : 502;
      return {
        success: false,
        error: this.resolveErrorMessage(axiosError),
        status: axiosError.response?.status ?? fallbackStatus,
        headers: this.normalizeHeaders(axiosError.response?.headers),
      };
    }
  }
}
