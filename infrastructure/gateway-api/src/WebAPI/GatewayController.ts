import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../Domain/enums/UserRole";
import { ProxyRequest } from "../Domain/clients/IMicroserviceClient";
import { verifyGatewayKey } from "../Middlewares/gatewayKey/GatewayKeyMiddleware";

export class GatewayController {
  private readonly router: Router;
  private readonly productionAuditScope = "proizvodnja";

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public routes - Authentication
    this.router.post("/login", this.login.bind(this));
    this.router.post("/register", this.register.bind(this));

    // Internal routes - Gateway key only (for inter-service calls)
    this.router.post(
      "/internal/audit/logs",
      verifyGatewayKey,
      this.proxyInternalAuditLog.bind(this)
    );

    // Protected routes - Users (Admin only)
    this.router.get(
      "/users",
      authenticate,
      authorize(UserRole.ADMIN),
      this.getAllUsers.bind(this)
    );
    this.router.get(
      "/users/:id",
      authenticate,
      authorize(UserRole.ADMIN),
      this.getUserById.bind(this)
    );

    // Production microservice routes (Seller, Sales Manager)
    this.router.all(
      "/production/*path",
      authenticate,
      authorize(UserRole.SELLER, UserRole.SALES_MANAGER),
      this.proxyToProduction.bind(this)
    );

    // Processing microservice routes (Seller, Sales Manager)
    this.router.all(
      "/processing/*path",
      authenticate,
      authorize(UserRole.SELLER, UserRole.SALES_MANAGER),
      this.proxyToProcessing.bind(this)
    );

    // Storage microservice routes (Seller, Sales Manager)
    this.router.all(
      "/storage/*path",
      authenticate,
      authorize(UserRole.SELLER, UserRole.SALES_MANAGER),
      this.proxyToStorage.bind(this)
    );

    // Sales microservice routes (Seller, Sales Manager)
    this.router.all(
      "/sales/*path",
      authenticate,
      authorize(UserRole.SELLER, UserRole.SALES_MANAGER),
      this.proxyToSales.bind(this)
    );

    // Data Analysis microservice routes (Admin only)
    this.router.all(
      "/data-analysis/*path",
      authenticate,
      authorize(UserRole.ADMIN),
      this.proxyToDataAnalysis.bind(this)
    );

    // Performance Analysis microservice routes (Admin only)
    this.router.all(
      "/performance-analysis/*path",
      authenticate,
      authorize(UserRole.ADMIN),
      this.proxyToPerformanceAnalysis.bind(this)
    );

    // Audit microservice - limited access log search for operational roles
    this.router.get(
      "/audit/logs/search",
      authenticate,
      authorize(UserRole.ADMIN, UserRole.SELLER, UserRole.SALES_MANAGER),
      this.enforceAuditLogSearchScope.bind(this),
      this.proxyToAudit.bind(this)
    );

    // Audit microservice routes (Admin only)
    this.router.all(
      "/audit/*path",
      authenticate,
      authorize(UserRole.ADMIN),
      this.proxyToAudit.bind(this)
    );
  }

  private enforceAuditLogSearchScope(req: Request, res: Response, next: () => void): void {
    const userRole = req.user?.role?.toUpperCase();
    if (!userRole) {
      res.status(401).json({ success: false, message: "Korisnik nije autentifikovan!" });
      return;
    }

    if (userRole === UserRole.ADMIN) {
      next();
      return;
    }

    const mikroservisQuery = req.query.mikroservis;
    const mikroservis = Array.isArray(mikroservisQuery) ? mikroservisQuery[0] : mikroservisQuery;

    if (mikroservis !== this.productionAuditScope) {
      res.status(403).json({
        success: false,
        message: "Nemate ovlascenja za pristup audit zapisima ovog mikroservisa!",
      });
      return;
    }

    next();
  }

  private async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginUserDTO = req.body;
      const result = await this.gatewayService.login(data);
      res.status(result.success ? 200 : 401).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  private async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegistrationUserDTO = req.body;
      const result = await this.gatewayService.register(data);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  private async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.gatewayService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await this.gatewayService.getUserById(id);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  private buildProxyRequest(req: Request, stripPrefix?: string): ProxyRequest {
    const rawPath = stripPrefix
      ? req.path.replace(new RegExp(`^/${stripPrefix}`), "")
      : req.path;
    const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    return {
      method: req.method as ProxyRequest["method"],
      path,
      data: req.body,
      params: req.query as Record<string, string>,
      headers: {
        Authorization: req.headers.authorization || "",
      },
    };
  }

  private async proxyToProduction(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToProduction(proxyRequest);
    res.status(response.status).json(response.success ? response.data : { error: response.error });
  }

  private async proxyToProcessing(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToProcessing(proxyRequest);
    res.status(response.status).json(response.success ? response.data : { error: response.error });
  }

  private async proxyToStorage(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToStorage(proxyRequest);
    res.status(response.status).json(response.success ? response.data : { error: response.error });
  }

  private async proxyToSales(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToSales(proxyRequest);
    res.status(response.status).json(response.success ? response.data : { error: response.error });
  }

  private async proxyToDataAnalysis(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToDataAnalysis(proxyRequest);
    res.status(response.status).json(response.success ? response.data : { error: response.error });
  }

  private async proxyToPerformanceAnalysis(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToPerformanceAnalysis(proxyRequest);
    res.status(response.status).json(response.success ? response.data : { error: response.error });
  }

  private async proxyToAudit(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req, "audit");
    const response = await this.gatewayService.proxyToAudit(proxyRequest);
    res.status(response.status).json(response.success ? response.data : { error: response.error });
  }

  private async proxyInternalAuditLog(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req, "internal/audit");
    const response = await this.gatewayService.proxyToAudit(proxyRequest);
    res.status(response.status).json(response.success ? response.data : { error: response.error });
  }

  public getRouter(): Router {
    return this.router;
  }
}
