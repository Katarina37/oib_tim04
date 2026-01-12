import { CorsOptions } from "cors";

export class CorsConfig {
  private readonly allowedOrigins: string[];
  private readonly allowedMethods: string[];

  constructor(
    allowedOriginsEnv = process.env.ALLOWED_ORIGINS ?? process.env.CORS_ORIGIN ?? process.env.CORS_ORIGINS ?? "",
    allowedMethodsEnv = process.env.CORS_METHODS ?? ""
  ) {
    this.allowedOrigins = this.parseList(allowedOriginsEnv, [
      "http://localhost:5173",
      "http://localhost:3000",
    ]);
    this.allowedMethods = this.parseList(allowedMethodsEnv, [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ]);
  }

  private parseList(raw: string, fallback: string[]): string[] {
    const candidates = raw
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    return candidates.length > 0 ? Array.from(new Set(candidates)) : fallback;
  }

  public buildOptions(): CorsOptions {
    const allowedOrigins = this.allowedOrigins;

    return {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      methods: this.allowedMethods,
      allowedHeaders: ["Content-Type", "Authorization", "X-Gateway-Key"],
      credentials: true,
    };
  }
}