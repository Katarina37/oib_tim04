import React, { useEffect } from "react";
import { BellRing, Check, X } from "lucide-react";
import { useNotificationCenter } from "../../hooks/useNotificationCenterHook";
import { formatDateTime } from "../../helpers/formatters";
import { NotificationPriority } from "../../models/notification/NotificationPriority";
import "./NotificationToastStack.css";

const priorityClassName: Record<NotificationPriority, string> = {
  [NotificationPriority.INFO]: "notification-toast--info",
  [NotificationPriority.WARNING]: "notification-toast--warning",
  [NotificationPriority.ERROR]: "notification-toast--error",
};

const NotificationToastStack: React.FC = () => {
  const { toastQueue, dismissToast, markAsRead } = useNotificationCenter();

  useEffect(() => {
    if (toastQueue.length === 0) {
      return;
    }

    const timeoutIds = toastQueue.map((notification) =>
      window.setTimeout(() => {
        dismissToast(notification.id);
      }, 6000)
    );

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [dismissToast, toastQueue]);

  if (toastQueue.length === 0) {
    return null;
  }

  return (
    <div className="notification-toast-stack" role="region" aria-label="Nova obaveštenja">
      {toastQueue.map((notification) => (
        <article
          key={notification.id}
          className={`notification-toast ${priorityClassName[notification.priority]}`}
        >
          <div className="notification-toast__header">
            <div className="notification-toast__title-wrap">
              <BellRing size={16} />
              <p className="notification-toast__title">{notification.title}</p>
            </div>
            <button
              type="button"
              className="notification-toast__icon-button"
              onClick={() => dismissToast(notification.id)}
              aria-label="Zatvori obaveštenje"
            >
              <X size={14} />
            </button>
          </div>

          <p className="notification-toast__message">{notification.message}</p>

          <div className="notification-toast__footer">
            <span>{formatDateTime(notification.createdAt)}</span>
            <button
              type="button"
              className="notification-toast__read-button"
              onClick={() => void markAsRead(notification.id)}
            >
              <Check size={14} />
              Označi kao pročitano
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default NotificationToastStack;
