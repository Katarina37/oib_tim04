import { Router, Request, Response } from "express";
import { ILogerService } from "../../Domain/services/ILogerService";
import { IUsersService } from "../../Domain/services/IUsersService";
import { CreateUserDTO } from "../../Domain/DTOs/CreateUserDTO";
import { UpdateUserDTO } from "../../Domain/DTOs/UpdateUserDTO";
import { UserSearchCriteriaDTO } from "../../Domain/DTOs/UserSearchCriteriaDTO";
import { validateCreateUserData, validateUpdateUserData } from "../validators/UserValidator";
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

  private async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log("Fetching all users");
      const users = await this.usersService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.logger.log(`Fetching user with ID ${id}`);
      const user = await this.usersService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR);
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async createUser(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log("Create user request received");
      const data: CreateUserDTO = req.body;

      const validation = validateCreateUserData(data);
      if (!validation.success) {
        await this.logger.log(`Validation failed: ${validation.message}`, LogType.WARNING);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const user = await this.usersService.createUser(data);
      await this.logger.log(`User ${data.username} created successfully`);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.logger.log(`Update user request for ID ${id}`);
      const data: UpdateUserDTO = req.body;

      const validation = validateUpdateUserData(data);
      if (!validation.success) {
        await this.logger.log(`Validation failed: ${validation.message}`, LogType.WARNING);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const user = await this.usersService.updateUser(id, data);
      await this.logger.log(`User ID ${id} updated successfully`);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.logger.log(`Delete user request for ID ${id}`);

      await this.usersService.deleteUser(id);
      await this.logger.log(`User ID ${id} deleted successfully`);
      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log("Search users request received");
      const criteria: UserSearchCriteriaDTO = {
        username: req.query.username as string | undefined,
        email: req.query.email as string | undefined,
        firstName: req.query.firstName as string | undefined,
        lastName: req.query.lastName as string | undefined,
        role: req.query.role as any,
      };

      const users = await this.usersService.searchUsers(criteria);
      await this.logger.log(`Found ${users.length} users matching criteria`);
      res.status(200).json(users);
    } catch (err) {
      await this.logger.log((err as Error).message, LogType.ERROR);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}