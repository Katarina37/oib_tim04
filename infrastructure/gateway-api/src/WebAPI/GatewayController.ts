import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { UpdateOwnProfileDTO } from "../Domain/DTOs/UpdateOwnProfileDTO";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";
import { UserRole } from "../Domain/enums/UserRole";
import { ProxyRequest, ProxyResponse } from "../Domain/clients/IMicroserviceClient";
import { IUserAccessPolicy } from "../Domain/services/IUserAccessPolicy";
import { AccessDeniedError } from "../Domain/errors/AccessDeniedError";

export class GatewayController {
  private readonly router: Router;

  constructor(
    private readonly gatewayService: IGatewayService,
    private readonly gatewayApiKey: string,
    private readonly userAccessPolicy: IUserAccessPolicy
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public routes - Authentication
    this.router.post("/login", this.login.bind(this));
    this.router.post("/register", this.register.bind(this));

    // Protected routes - Users (Admin only)
    this.router.get(
      "/users",
      authenticate,
      authorize(UserRole.ADMIN),
      this.getAllUsers.bind(this)
    );
    this.router.get(
      "/users/search",
      authenticate,
      authorize(UserRole.ADMIN),
      this.searchUsers.bind(this)
    );
    this.router.get(
      "/users/me",
      authenticate,
      this.getCurrentUser.bind(this)
    );
    this.router.put(
      "/users/me",
      authenticate,
      this.updateCurrentUser.bind(this)
    );
    this.router.get(
      "/users/:id",
      authenticate,
      authorize(UserRole.ADMIN),
      this.getUserById.bind(this)
    );
    this.router.post(
      "/users",
      authenticate,
      authorize(UserRole.ADMIN),
      this.createUser.bind(this)
    );
    this.router.put(
      "/users/:id",
      authenticate,
      authorize(UserRole.ADMIN),
      this.updateUser.bind(this)
    );
    this.router.delete(
      "/users/:id",
      authenticate,
      authorize(UserRole.ADMIN),
      this.deleteUser.bind(this)
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

    // Packaging microservice routes (Seller, Sales Manager)
    this.router.all(
      "/packaging/*path",
      authenticate,
      authorize(UserRole.SELLER, UserRole.SALES_MANAGER),
      this.proxyToPackaging.bind(this)
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
      "/sales", authenticate,
      authorize(UserRole.SELLER, UserRole.SALES_MANAGER), 
      this.proxyToSales.bind(this)
    );

    this.router.all(
      "/sales/*path",
      authenticate,
      authorize(UserRole.SELLER, UserRole.SALES_MANAGER),
      this.proxyToSales.bind(this)
    );

    // Weather microservice routes (Seller only)
    this.router.all(
      "/weather/*path",
      authenticate,
      authorize(UserRole.SELLER),
      this.proxyToWeather.bind(this)
    );
    this.router.all(
      "/weather",
      authenticate,
      authorize(UserRole.SELLER),
      this.proxyToWeather.bind(this)
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
      "/performance-analysis",
      authenticate,
      authorize(UserRole.ADMIN),
      this.proxyToPerformanceAnalysis.bind(this)
    );

    this.router.all(
      "/performance-analysis/*path",
      authenticate,
      authorize(UserRole.ADMIN),
      this.proxyToPerformanceAnalysis.bind(this)
    );

    // Audit microservice - constrained log search (needed for production diary view)
    this.router.get(
      "/audit/logs/search",
      authenticate,
      authorize(UserRole.ADMIN, UserRole.SELLER, UserRole.SALES_MANAGER),
      this.proxyToAudit.bind(this)
    );

    // Internal audit route (service-to-service, gateway key only)
    this.router.all(
      "/internal/audit",
      this.requireGatewayKey.bind(this),
      this.proxyToAuditInternal.bind(this)
    );
    this.router.all(
      "/internal/audit/*path",
      this.requireGatewayKey.bind(this),
      this.proxyToAuditInternal.bind(this)
    );

    // Audit microservice routes (Admin only)
    this.router.all(
      "/audit/*path",
      authenticate,
      authorize(UserRole.ADMIN),
      this.proxyToAudit.bind(this)
    );
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

  private async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.gatewayService.searchUsers(
        req.query as Record<string, unknown>
      );
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private async getCurrentUser(req: Request, res: Response): Promise<void> {
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      res.status(401).json({ success: false, message: "Korisnik nije autentifikovan!" });
      return;
    }

    try {
      this.userAccessPolicy.ensureCanAccess(req.user?.id, currentUserId);
      const user = await this.gatewayService.getUserById(currentUserId);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }

      res.status(404).json({ message: (error as Error).message });
    }
  }

  private async updateCurrentUser(req: Request, res: Response): Promise<void> {
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      res.status(401).json({ success: false, message: "Korisnik nije autentifikovan!" });
      return;
    }

    const payload = req.body as Record<string, unknown>;
    if (payload.role !== undefined) {
      res.status(400).json({
        success: false,
        message: "Promena uloge nije dozvoljena preko edit profila.",
      });
      return;
    }

    const data: UpdateOwnProfileDTO = {
      username: typeof payload.username === "string" ? payload.username : undefined,
      password: typeof payload.password === "string" ? payload.password : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined,
      firstName: typeof payload.firstName === "string" ? payload.firstName : undefined,
      lastName: typeof payload.lastName === "string" ? payload.lastName : undefined,
      profileImage: typeof payload.profileImage === "string" ? payload.profileImage : undefined,
    };

    try {
      this.userAccessPolicy.ensureCanAccess(req.user?.id, currentUserId);
      const user = await this.gatewayService.updateUser(currentUserId, data);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }

      res.status(400).json({ success: false, message: (error as Error).message });
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

  private async createUser(req: Request, res: Response): Promise<void> {
    try {
      const data: RegistrationUserDTO = req.body;
      const user = await this.gatewayService.createUser(data);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  private async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data: Partial<RegistrationUserDTO> = req.body;
      const user = await this.gatewayService.updateUser(id, data);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  private async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.gatewayService.deleteUser(id);
      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      res.status(404).json({ success: false, message: (error as Error).message });
    }
  }

  private buildProxyRequest(req: Request, stripPrefix?: string): ProxyRequest {
    const rawPath = stripPrefix
      ? req.path.replace(new RegExp(`^/${stripPrefix}`), "")
      : req.path;
    const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    const acceptHeader = req.headers.accept as unknown;
    const contentTypeHeader = req.headers["content-type"] as unknown;

    const accept =
      typeof acceptHeader === "string"
        ? acceptHeader
        : Array.isArray(acceptHeader)
          ? acceptHeader.join(", ")
          : "";
    const contentType =
      typeof contentTypeHeader === "string"
        ? contentTypeHeader
        : Array.isArray(contentTypeHeader)
          ? contentTypeHeader[0]
          : "";

    return {
      method: req.method as ProxyRequest["method"],
      path,
      data: req.body,
      params: req.query as Record<string, string>,
      headers: {
          Authorization: req.headers.authorization || "",
          Accept: accept || "application/json",
          ...(contentType ? { "Content-Type": contentType } : {}),
          "X-User-Id": String(req.user?.id ?? ""),
          "X-User-Role": req.user?.role ?? "",
          "X-Demo-Date": (req.headers["x-demo-date"] as string) || "",
      },
    };
  }

  private sendProxyResponse(res: Response, response: ProxyResponse): void {
    if (!response.success) {
      res.status(response.status).json({ error: response.error });
      return;
    }

    const contentType = response.headers?.["content-type"]?.toLowerCase();
    const contentDisposition = response.headers?.["content-disposition"];

    if (contentType?.includes("application/pdf")) {
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }

      if (contentDisposition) {
        res.setHeader("Content-Disposition", contentDisposition);
      }

      const payload = response.data;

      if (Buffer.isBuffer(payload)) {
        res.status(response.status).send(payload);
        return;
      }

      if (payload instanceof ArrayBuffer) {
        res.status(response.status).send(Buffer.from(payload));
        return;
      }

      if (ArrayBuffer.isView(payload)) {
        res
          .status(response.status)
          .send(Buffer.from(payload.buffer, payload.byteOffset, payload.byteLength));
        return;
      }

      if (typeof payload === "string") {
        res.status(response.status).send(Buffer.from(payload, "binary"));
        return;
      }

      res.status(500).json({ error: "Neispravan PDF odgovor mikroservisa." });
      return;
    }

    res.status(response.status).json(response.data);
  }

  private async proxyToProduction(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToProduction(proxyRequest);
    this.sendProxyResponse(res, response);
  }

  private async proxyToProcessing(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToProcessing(proxyRequest);
    this.sendProxyResponse(res, response);
  }

  private async proxyToStorage(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToStorage(proxyRequest);
    this.sendProxyResponse(res, response);
  }

  private async proxyToPackaging(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToPackaging(proxyRequest);
    this.sendProxyResponse(res, response);
  }

  private async proxyToSales(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToSales(proxyRequest);
    this.sendProxyResponse(res, response);
  }

  private async proxyToWeather(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToWeather(proxyRequest);
    this.sendProxyResponse(res, response);
  }

  private async proxyToDataAnalysis(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToDataAnalysis(proxyRequest);
    this.sendProxyResponse(res, response);
  }

  private async proxyToPerformanceAnalysis(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req);
    const response = await this.gatewayService.proxyToPerformanceAnalysis(proxyRequest);
    this.sendProxyResponse(res, response);
  }

  private async proxyToAudit(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req, "audit");
    const response = await this.gatewayService.proxyToAudit(proxyRequest);
    this.sendProxyResponse(res, response);
  }

  private async proxyToAuditInternal(req: Request, res: Response): Promise<void> {
    const proxyRequest = this.buildProxyRequest(req, "internal/audit");
    const response = await this.gatewayService.proxyToAudit(proxyRequest);
    this.sendProxyResponse(res, response);
  }

  private requireGatewayKey(req: Request, res: Response, next: () => void): void {
    const headerValue = req.headers["x-gateway-key"];
    const incomingKey = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!incomingKey || incomingKey !== this.gatewayApiKey) {
      res.status(403).json({ success: false, message: "Nevalidan X-Gateway-Key" });
      return;
    }

    next();
  }

  public getRouter(): Router {
    return this.router;
  }
}
