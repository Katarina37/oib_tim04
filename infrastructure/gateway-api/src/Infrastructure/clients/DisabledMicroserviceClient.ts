import {
  IMicroserviceClient,
  ProxyRequest,
  ProxyResponse,
} from "../../Domain/clients/IMicroserviceClient";

export class DisabledMicroserviceClient implements IMicroserviceClient {
  constructor(
    private readonly serviceName: string,
    private readonly reason: string
  ) {}

  setAuthHeader(_token: string): void {
    // No-op: service is disabled by configuration.
  }

  async proxy<T = unknown>(_request: ProxyRequest): Promise<ProxyResponse<T>> {
    return {
      success: false,
      error: `${this.serviceName} service is unavailable: ${this.reason}`,
      status: 503,
    };
  }
}
