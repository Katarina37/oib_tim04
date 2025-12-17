import { NextFunction, Request, Response, RequestHandler } from "express";

export class GatewayAuthMiddleware {
  private readonly expectedKey: string;

  constructor(gatewayApiKey: string) {
    if (!gatewayApiKey) {
      throw new Error("GATEWAY_API_KEY is required");
    }
    this.expectedKey = gatewayApiKey;
  }

  public getHandler(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      const incomingKey = this.extractKey(req);

      if (!incomingKey || incomingKey !== this.expectedKey) {
        res.status(403).json({ message: "Pristup zabranjen: nevalidan X-Gateway-Key" });
        return;
      }

      next();
    };
  }

  private extractKey(req: Request): string | undefined {
    const headerValue = req.headers["x-gateway-key"];
    if (Array.isArray(headerValue)) {
      return headerValue[0];
    }
    return typeof headerValue === "string" ? headerValue : undefined;
  }
}
