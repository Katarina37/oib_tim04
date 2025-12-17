import { CorsOptions } from "cors";
import { requireOneOfEnv } from "./env";

export class CorsConfig {
  private readonly allowedOrigins: string[];
  private readonly allowedMethods: string[];

  constructor(
    allowedOriginsEnv = requireOneOfEnv([
      "CORS_ALLOWED_ORIGINS",
      "ALLOWED_ORIGINS",
      "CORS_ORIGIN",
      "CORS_ORIGINS",
    ]),
    allowedMethodsEnv = requireOneOfEnv([
      "CORS_ALLOWED_METHODS",
      "ALLOWED_METHODS",
      "CORS_METHODS",
    ])
  ) {
    this.allowedOrigins = this.parseList(allowedOriginsEnv, "CORS_ALLOWED_ORIGINS");
    this.allowedMethods = this.parseList(allowedMethodsEnv, "CORS_ALLOWED_METHODS").map((method) =>
      method.toUpperCase()
    );

    if (this.allowedMethods.includes("*")) {
      throw new Error(
        'CORS_ALLOWED_METHODS cannot contain "*". Provide an explicit comma-separated list (e.g. GET,POST,PUT,DELETE,OPTIONS).'
      );
    }
  }

  private parseList(raw: string, label: string): string[] {
    const entries = raw
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    if (entries.length === 0) {
      throw new Error(`${label} must be a non-empty comma-separated list`);
    }

    return Array.from(new Set(entries));
  }

  public buildOptions(): CorsOptions {
    const allowedOrigins = this.allowedOrigins;

    return {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      methods: this.allowedMethods,
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    };
  }
}
