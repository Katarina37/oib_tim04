import { AxiosRequestConfig } from "axios";

export interface ProxyRequest {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  data?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

export interface ProxyResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface IMicroserviceClient {
  proxy<T = unknown>(request: ProxyRequest): Promise<ProxyResponse<T>>;
  setAuthHeader(token: string): void;
}