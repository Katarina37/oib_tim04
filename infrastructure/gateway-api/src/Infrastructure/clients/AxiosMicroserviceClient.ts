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
  ) {}

  setAuthHeader(token: string): void {
    this.authToken = token;
  }

  async proxy<T = unknown>(request: ProxyRequest): Promise<ProxyResponse<T>> {
    try {
      const headers: Record<string, string> = {
        "X-Gateway-Key": this.gatewayApiKey,
        ...request.headers,
      };

      if (this.authToken) {
        headers["Authorization"] = `Bearer ${this.authToken}`;
      }

      const response = await this.httpClient.request<T>({
        method: request.method,
        url: request.path,
        data: request.data,
        params: request.params,
        headers,
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message,
        status: axiosError.response?.status || 500,
      };
    }
  }
}