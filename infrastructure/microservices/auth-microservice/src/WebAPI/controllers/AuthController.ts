import { Request, Response, Router } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { IAuthService } from "../../Domain/services/IAuthService";
import { ILogerService } from "../../Domain/services/ILogerService";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";
import { validateLoginData } from "../validators/LoginValidator";
import { validateRegistrationData } from "../validators/RegisterValidator";
import { LogType } from "../../Services/LogerService";

export class AuthController {
  private readonly router: Router;
  private readonly jwtSecret: string;
  private readonly jwtOptions: SignOptions;

  constructor(
    private readonly authService: IAuthService,
    private readonly logerService: ILogerService
  ) {
    this.router = Router();
    this.jwtSecret = process.env.JWT_SECRET || "default_secret";
    this.jwtOptions = {
      expiresIn: "6h",
    };
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/auth/login", this.login.bind(this));
    this.router.post("/auth/register", this.register.bind(this));
  }

  private generateToken(payload: object): string {
    return jwt.sign(payload, this.jwtSecret, this.jwtOptions);
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
  }

  private async login(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      await this.logerService.log("Login request received", LogType.INFO, {
        ipAdresa: clientIp,
      });

      const data: LoginUserDTO = req.body;
      const validation = validateLoginData(data);

      if (!validation.success) {
        await this.logerService.log(
          `Login validation failed: ${validation.message}`,
          LogType.WARNING,
          {
            ipAdresa: clientIp,
            dodatniPodaci: { attemptedUsername: data.username || "not provided" },
          }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.authService.login(data);

      if (result.authenificated && result.userData) {
        const token = this.generateToken({
          id: result.userData.id,
          username: result.userData.username,
          role: result.userData.role,
          firstName: result.userData.firstName,
          lastName: result.userData.lastName,
        });

        await this.logerService.log(
          `User ${data.username} logged in successfully`,
          LogType.INFO,
          {
            korisnikId: result.userData.id,
            ipAdresa: clientIp,
            dodatniPodaci: {
              username: data.username,
              role: result.userData.role,
            },
          }
        );

        res.status(200).json({ success: true, token });
      } else {
        await this.logerService.log(
          `Failed login attempt for user: ${data.username}`,
          LogType.WARNING,
          {
            ipAdresa: clientIp,
            dodatniPodaci: {
              attemptedUsername: data.username,
              reason: result.message || "Invalid credentials",
            },
          }
        );
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      await this.logerService.log(
        `Login error: ${(error as Error).message}`,
        LogType.ERROR,
        {
          ipAdresa: clientIp,
          dodatniPodaci: { error: (error as Error).message },
        }
      );
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  private async register(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      await this.logerService.log("Registration request received", LogType.INFO, {
        ipAdresa: clientIp,
      });

      const data: RegistrationUserDTO = req.body;
      const validation = validateRegistrationData(data);

      if (!validation.success) {
        await this.logerService.log(
          `Registration validation failed: ${validation.message}`,
          LogType.WARNING,
          {
            ipAdresa: clientIp,
            dodatniPodaci: {
              attemptedUsername: data.username || "not provided",
              attemptedEmail: data.email || "not provided",
            },
          }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.authService.register(data);

      if (result.authenificated && result.userData) {
        const token = this.generateToken({
          id: result.userData.id,
          username: result.userData.username,
          role: result.userData.role,
          firstName: result.userData.firstName,
          lastName: result.userData.lastName,
        });

        await this.logerService.log(
          `User ${data.username} registered successfully`,
          LogType.INFO,
          {
            korisnikId: result.userData.id,
            ipAdresa: clientIp,
            dodatniPodaci: {
              username: data.username,
              email: data.email,
              role: data.role,
            },
          }
        );

        res.status(201).json({
          success: true,
          message: "Registration successful",
          token,
        });
      } else {
        await this.logerService.log(
          `Registration failed for user: ${data.username}`,
          LogType.WARNING,
          {
            ipAdresa: clientIp,
            dodatniPodaci: {
              attemptedUsername: data.username,
              attemptedEmail: data.email,
              reason: result.message || "Registration failed",
            },
          }
        );
        res.status(400).json({
          success: false,
          message: result.message || "Registration failed",
        });
      }
    } catch (error) {
      await this.logerService.log(
        `Registration error: ${(error as Error).message}`,
        LogType.ERROR,
        {
          ipAdresa: clientIp,
          dodatniPodaci: { error: (error as Error).message },
        }
      );
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}