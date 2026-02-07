import { NextFunction, Request, RequestHandler, Response } from "express";

export class InternalServiceOnlyMiddleware {
  public getHandler(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      const hasUserContext =
        this.hasNonEmptyHeader(req.headers["x-user-id"]) ||
        this.hasNonEmptyHeader(req.headers["x-user-role"]);
      const hasAuthorization = this.hasNonEmptyHeader(req.headers.authorization);

      if (hasUserContext || hasAuthorization) {
        res.status(403).json({
          success: false,
          message:
            "Ruta je dostupna samo internim servisima. Za pakovanje koristi /packaging/package-perfumes.",
        });
        return;
      }

      next();
    };
  }

  private hasNonEmptyHeader(value: string | string[] | undefined): boolean {
    if (Array.isArray(value)) {
      return value.some((entry) => entry.trim().length > 0);
    }

    return typeof value === "string" && value.trim().length > 0;
  }
}
