import { ReactNode, createContext, useContext, useMemo } from "react";
import { IPlantAPI } from "../api/plants/IPlantAPI";
import { IAuthAPI } from "../api/auth/IAuthAPI";
import { IUserAPI } from "../api/users/IUserAPI";
import { PlantAPI } from "../api/plants/PlantAPI";
import { AuthAPI } from "../api/auth/AuthAPI";
import { UserAPI } from "../api/users/UserAPI";
import { AxiosHttpClient } from "../api/http/AxiosHttpClient";
import { IHttpClient } from "../api/http/IHttpClient";
import { AuditAPI } from "../api/audit/AuditAPI";
import { IAuditAPI } from "../api/audit/IAuditAPI";
import { IAnalysisAPI } from "../api/analysis/IAnalysisAPI";
import { AnalysisAPI } from "../api/analysis/AnalysisAPI";
import { IStorageAPI } from "../api/storage/IStorageAPI";
import { StorageAPI } from "../api/storage/StorageAPI";
import { IWeatherAPI } from "../api/weather/IWeatherAPI";
import { WeatherAPI } from "../api/weather/WeatherAPI";
import { IPerformanceAPI } from "../api/performance/IPerformanceAPI";
import { PerformanceAPI } from "../api/performance/PerformanceAPI";
import { ISaleAPI } from "../api/sale/ISaleAPI";
import { SalesAPI } from "../api/sale/SaleAPI";

type ServiceContextValue = {
  plantAPI: IPlantAPI;
  authAPI: IAuthAPI;
  userAPI: IUserAPI;
  auditAPI: IAuditAPI;
  analysisAPI: IAnalysisAPI;
  storageAPI: IStorageAPI;
  weatherAPI: IWeatherAPI;
  performanceAPI: IPerformanceAPI;
  saleAPI: ISaleAPI;
};

type ServiceProviderProps = {
  children: ReactNode;
  httpClient?: IHttpClient;
};

const ServiceContext = createContext<ServiceContextValue | undefined>(undefined);

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children, httpClient }) => {
  const gatewayUrl = import.meta.env.VITE_GATEWAY_URL;

  const resolvedHttpClient = useMemo<IHttpClient>(() => {
    return httpClient ?? new AxiosHttpClient(gatewayUrl);
  }, [httpClient, gatewayUrl]);

  const services = useMemo<ServiceContextValue>(
    () => ({
      plantAPI: new PlantAPI(resolvedHttpClient),
      authAPI: new AuthAPI(resolvedHttpClient),
      userAPI: new UserAPI(resolvedHttpClient),
      auditAPI: new AuditAPI(resolvedHttpClient),
      analysisAPI: new AnalysisAPI(resolvedHttpClient),
      storageAPI: new StorageAPI(resolvedHttpClient),
      weatherAPI: new WeatherAPI(resolvedHttpClient),
      performanceAPI: new PerformanceAPI(resolvedHttpClient),
      saleAPI: new SalesAPI(resolvedHttpClient),
    }),
    [resolvedHttpClient]
  );

  return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
};

export const useServices = (): ServiceContextValue => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return context;
};
