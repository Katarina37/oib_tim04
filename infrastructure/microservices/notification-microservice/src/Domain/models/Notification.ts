import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { NotificationPriority } from "../enums/NotificationPriority";
import { NotificationTargetRole } from "../enums/NotificationTargetRole";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 160 })
  title!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "enum", enum: NotificationPriority })
  priority!: NotificationPriority;

  @Column({ type: "varchar", length: 120, name: "event_type" })
  eventType!: string;

  @Column({ type: "varchar", length: 100, name: "source_service" })
  sourceService!: string;

  @Column({ type: "enum", enum: NotificationTargetRole, nullable: true, name: "target_role" })
  targetRole!: NotificationTargetRole | null;

  @Column({ type: "int", nullable: true, name: "target_user_id" })
  targetUserId!: number | null;

  @Column({ type: "boolean", default: false, name: "is_read" })
  isRead!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ type: "datetime", nullable: true, name: "read_at" })
  readAt!: Date | null;

  @Column({ type: "json", nullable: true, name: "metadata" })
  metadata!: Record<string, unknown> | null;
}
