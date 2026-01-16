import { CorsOptions } from "cors";
import { getOptionalEnv } from "../../config/env";

export class CorsConfig {
  private readonly allowedOrigins: string[];
  private readonly allowedMethods: string[];

  constructor() {
    const originsEnv = getOptionalEnv("CORS_ORIGIN") || "http://localhost:4000";
    this.allowedOrigins = originsEnv.split(",").map((origin) => origin.trim());

    const methodsEnv = getOptionalEnv("CORS_METHODS") || "GET,POST,PUT,DELETE,OPTIONS";
    this.allowedMethods = methodsEnv.split(",").map((method) => method.trim());
  }

  buildOptions(): CorsOptions {
    return {
      origin: (origin, callback) => {
        if (!origin || this.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS policy violation"));
        }
      },
      methods: this.allowedMethods,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "X-Gateway-Key", "X-Demo-Date"],
    };
  }
}
