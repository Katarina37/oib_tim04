import { Router, Request, Response } from "express";
import { ILogerService } from "../../Domain/services/ILogerService";
import { IUsersService } from "../../Domain/services/IUsersService";
import { CreateUserDTO } from "../../Domain/DTOs/CreateUserDTO";
import { UpdateUserDTO } from "../../Domain/DTOs/UpdateUserDTO";
import { UserSearchCriteriaDTO } from "../../Domain/DTOs/UserSearchCriteriaDTO";
import {
  validateCreateUserData,
  validateUpdateUserData,
} from "../validators/UserValidator";
import { LogType } from "../../Services/LogerService";

export class UsersController {
  private readonly router: Router;

  constructor(
    private readonly usersService: IUsersService,
    private readonly logger: ILogerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/users", this.getAllUsers.bind(this));
    this.router.get("/users/search", this.searchUsers.bind(this));
    this.router.get("/users/:id", this.getUserById.bind(this));
    this.router.post("/users", this.createUser.bind(this));
    this.router.put("/users/:id", this.updateUser.bind(this));
    this.router.delete("/users/:id", this.deleteUser.bind(this));
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
  }

  private async getAllUsers(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      await this.logger.log("Fetching all users", LogType.INFO, {
        ipAdresa: clientIp,
      });

      const users = await this.usersService.getAllUsers();

      await this.logger.log(
        `Successfully fetched ${users.length} users`,
        LogType.INFO,
        {
          ipAdresa: clientIp,
          dodatniPodaci: { count: users.length },
        }
      );

      res.status(200).json(users);
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR, {
        ipAdresa: clientIp,
        dodatniPodaci: { error: (err as Error).message },
      });
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const id = parseInt(req.params.id, 10);

    try {
      await this.logger.log(`Fetching user with ID ${id}`, LogType.INFO, {
        ipAdresa: clientIp,
        dodatniPodaci: { targetUserId: id },
      });

      const user = await this.usersService.getUserById(id);

      await this.logger.log(
        `Successfully fetched user with ID ${id}`,
        LogType.INFO,
        {
          korisnikId: id,
          ipAdresa: clientIp,
          dodatniPodaci: { username: user.username },
        }
      );

      res.status(200).json(user);
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR, {
        ipAdresa: clientIp,
        dodatniPodaci: { targetUserId: id, error: (err as Error).message },
      });
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async createUser(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      await this.logger.log("Create user request received", LogType.INFO, {
        ipAdresa: clientIp,
      });

      const data: CreateUserDTO = req.body;
      const validation = validateCreateUserData(data);

      if (!validation.success) {
        await this.logger.log(
          `Validation failed: ${validation.message}`,
          LogType.WARNING,
          {
            ipAdresa: clientIp,
            dodatniPodaci: {
              attemptedUsername: data.username || "not provided",
              validationError: validation.message,
            },
          }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const user = await this.usersService.createUser(data);

      await this.logger.log(
        `User ${data.username} created successfully`,
        LogType.INFO,
        {
          korisnikId: user.id,
          ipAdresa: clientIp,
          dodatniPodaci: {
            username: user.username,
            email: user.email,
            role: user.role,
          },
        }
      );

      res.status(201).json({ success: true, data: user });
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR, {
        ipAdresa: clientIp,
        dodatniPodaci: { error: (err as Error).message },
      });
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async updateUser(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const id = parseInt(req.params.id, 10);

    try {
      await this.logger.log(`Update user request for ID ${id}`, LogType.INFO, {
        ipAdresa: clientIp,
        dodatniPodaci: { targetUserId: id },
      });

      const data: UpdateUserDTO = req.body;
      const validation = validateUpdateUserData(data);

      if (!validation.success) {
        await this.logger.log(
          `Validation failed: ${validation.message}`,
          LogType.WARNING,
          {
            ipAdresa: clientIp,
            dodatniPodaci: {
              targetUserId: id,
              validationError: validation.message,
            },
          }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const user = await this.usersService.updateUser(id, data);

      await this.logger.log(
        `User ID ${id} updated successfully`,
        LogType.INFO,
        {
          korisnikId: id,
          ipAdresa: clientIp,
          dodatniPodaci: {
            updatedFields: Object.keys(data),
            username: user.username,
          },
        }
      );

      res.status(200).json({ success: true, data: user });
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR, {
        korisnikId: id,
        ipAdresa: clientIp,
        dodatniPodaci: { targetUserId: id, error: (err as Error).message },
      });
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async deleteUser(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const id = parseInt(req.params.id, 10);

    try {
      await this.logger.log(`Delete user request for ID ${id}`, LogType.INFO, {
        ipAdresa: clientIp,
        dodatniPodaci: { targetUserId: id },
      });

      await this.usersService.deleteUser(id);

      await this.logger.log(
        `User ID ${id} deleted successfully`,
        LogType.INFO,
        {
          korisnikId: id,
          ipAdresa: clientIp,
          dodatniPodaci: { deletedUserId: id },
        }
      );

      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR, {
        ipAdresa: clientIp,
        dodatniPodaci: { targetUserId: id, error: (err as Error).message },
      });
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async searchUsers(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      const criteria: UserSearchCriteriaDTO = {
        username: req.query.username as string | undefined,
        email: req.query.email as string | undefined,
        firstName: req.query.firstName as string | undefined,
        lastName: req.query.lastName as string | undefined,
        role: req.query.role as any,
      };

      await this.logger.log("Search users request received", LogType.INFO, {
        ipAdresa: clientIp,
        dodatniPodaci: { searchCriteria: criteria },
      });

      const users = await this.usersService.searchUsers(criteria);

      await this.logger.log(
        `Found ${users.length} users matching criteria`,
        LogType.INFO,
        {
          ipAdresa: clientIp,
          dodatniPodaci: {
            searchCriteria: criteria,
            resultCount: users.length,
          },
        }
      );

      res.status(200).json(users);
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR, {
        ipAdresa: clientIp,
        dodatniPodaci: { error: (err as Error).message },
      });
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
