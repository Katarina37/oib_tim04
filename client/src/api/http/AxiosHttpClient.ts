import axios, { AxiosInstance } from "axios";
import { IHttpClient, HttpRequestConfig } from "./IHttpClient";

export class AxiosHttpClient implements IHttpClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL?: string) {
    if (!baseURL) {
      throw new Error("VITE_GATEWAY_URL is not defined. HTTP client must route through the gateway.");
    }

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private mapConfig(config?: HttpRequestConfig) {
    return {
      headers: config?.headers,
      params: config?.params,
    };
  }

  async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, this.mapConfig(config));
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, this.mapConfig(config));
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, this.mapConfig(config));
    return response.data;
  }

  async delete<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, this.mapConfig(config));
    return response.data;
  }
}
