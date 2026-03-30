import { Repository } from "typeorm";
import { NotificationQueryDTO, NotificationUserContext } from "../../Domain/DTOs/NotificationQueryDTO";
import { Notification } from "../../Domain/models/Notification";
import { NotificationEmailLog } from "../../Domain/models/NotificationEmailLog";
import { INotificationRepository } from "../../Domain/repositories/INotificationRepository";

export class TypeOrmNotificationRepository implements INotificationRepository {
  constructor(
    private readonly notificationRepository: Repository<Notification>,
    private readonly emailLogRepository: Repository<NotificationEmailLog>
  ) {}

  create(data: Partial<Notification>): Notification {
    return this.notificationRepository.create(data);
  }

  save(notification: Notification): Promise<Notification> {
    return this.notificationRepository.save(notification);
  }

  findById(id: number): Promise<Notification | null> {
    return this.notificationRepository.findOne({ where: { id } });
  }

  async getForUser(
    context: NotificationUserContext,
    query: NotificationQueryDTO
  ): Promise<Notification[]> {
    const qb = this.notificationRepository
      .createQueryBuilder("n")
      .where("(n.targetUserId IS NULL OR n.targetUserId = :userId)", {
        userId: context.userId,
      })
      .andWhere("(n.targetRole IS NULL OR n.targetRole = :role)", {
        role: context.role,
      });

    if (query.priority) {
      qb.andWhere("n.priority = :priority", { priority: query.priority });
    }

    if (query.unreadOnly) {
      qb.andWhere("n.isRead = :isRead", { isRead: false });
    }

    qb.orderBy("n.createdAt", "DESC")
      .skip(query.offset ?? 0)
      .take(query.limit ?? 30);

    return qb.getMany();
  }

  async countUnreadForUser(context: NotificationUserContext): Promise<number> {
    return this.notificationRepository
      .createQueryBuilder("n")
      .where("(n.targetUserId IS NULL OR n.targetUserId = :userId)", {
        userId: context.userId,
      })
      .andWhere("(n.targetRole IS NULL OR n.targetRole = :role)", {
        role: context.role,
      })
      .andWhere("n.isRead = :isRead", { isRead: false })
      .getCount();
  }

  async markAllAsReadForUser(context: NotificationUserContext): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where("(target_user_id IS NULL OR target_user_id = :userId)", {
        userId: context.userId,
      })
      .andWhere("(target_role IS NULL OR target_role = :role)", {
        role: context.role,
      })
      .andWhere("is_read = :isRead", { isRead: false })
      .execute();

    return result.affected ?? 0;
  }

  createEmailLog(data: Partial<NotificationEmailLog>): NotificationEmailLog {
    return this.emailLogRepository.create(data);
  }

  saveEmailLog(log: NotificationEmailLog): Promise<NotificationEmailLog> {
    return this.emailLogRepository.save(log);
  }

  async getEmailLogs(limit: number): Promise<NotificationEmailLog[]> {
    return this.emailLogRepository.find({
      order: { createdAt: "DESC" },
      take: limit,
    });
  }
}
