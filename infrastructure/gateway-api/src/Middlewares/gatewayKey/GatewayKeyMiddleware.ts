import { NextFunction, Request, Response } from "express";

const buildError = (message: string) => ({
  success: false,
  message,
});

export const verifyGatewayKey = (req: Request, res: Response, next: NextFunction): void => {
  const expectedKey = process.env.GATEWAY_API_KEY;
  if (!expectedKey) {
    res.status(500).json(buildError("GATEWAY_API_KEY nije konfigurisan!"));
    return;
  }

  const incomingKeyHeader = req.headers["x-gateway-key"];
  const incomingKey = Array.isArray(incomingKeyHeader)
    ? incomingKeyHeader[0]
    : incomingKeyHeader;

  if (!incomingKey || incomingKey !== expectedKey) {
    res.status(403).json(buildError("Pristup zabranjen: nevalidan X-Gateway-Key"));
    return;
  }

  next();
};
