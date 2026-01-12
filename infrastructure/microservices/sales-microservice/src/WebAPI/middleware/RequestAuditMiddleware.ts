import { NextFunction, Request, Response, RequestHandler } from "express";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { LogType } from "../../Domain/enums/LogType";

export class RequestAuditMiddleware {
  constructor(private readonly logger: ILoggerService) {}
  public getHandler(): RequestHandler {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const clientIp = this.getClientIp(req);

      try {
        await this.logger.log(`Incoming ${req.method} ${req.originalUrl}`, LogType.INFO, {
          ipAddress: clientIp,
          additionalData: {
            userAgent: req.headers["user-agent"],
          },
        });
      } catch (error) {
        console.error(
          "\x1b[31m[AuditMiddleware]\x1b[0m Failed to log request",
          (error as Error).message
        );
      }

      next();
    };
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
  }
}
