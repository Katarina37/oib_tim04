import { Request, Response, NextFunction, RequestHandler } from "express";

export class GatewayAuthMiddleware {
  constructor(private readonly gatewayApiKey: string) {}

  getHandler(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      const providedKey = req.headers["x-gateway-key"];

      if (!providedKey) {
        res.status(401).json({
          success: false,
          message: "Nedostaje X-Gateway-Key header",
        });
        return;
      }

      if (providedKey !== this.gatewayApiKey) {
        res.status(403).json({
          success: false,
          message: "Neispravan API kljuc",
        });
        return;
      }

      next();
    };
  }
}
