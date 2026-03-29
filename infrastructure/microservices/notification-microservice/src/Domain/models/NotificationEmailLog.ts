import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("notification_email_log")
export class NotificationEmailLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", name: "notification_id", nullable: true })
  notificationId!: number | null;

  @Column({ type: "varchar", length: 160 })
  subject!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "varchar", length: 40, name: "target_role", nullable: true })
  targetRole!: string | null;

  @Column({ type: "int", name: "target_user_id", nullable: true })
  targetUserId!: number | null;

  @Column({ type: "json", nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
