import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Check, CheckCheck, Filter, Mail, RefreshCw } from "lucide-react";
import { useServices } from "../contexts/ServiceContext";
import { useAuth } from "../hooks/useAuthHook";
import { useNotificationCenter } from "../hooks/useNotificationCenterHook";
import { formatDateTime } from "../helpers/formatters";
import { normalizeRole } from "../helpers/roleAccess";
import { NotificationDTO } from "../models/notification/NotificationDTO";
import { NotificationEmailLogDTO } from "../models/notification/NotificationEmailLogDTO";
import { NotificationPriority } from "../models/notification/NotificationPriority";
import "./NotificationsPage.css";

type PriorityFilter = "ALL" | NotificationPriority;

const priorityLabels: Record<NotificationPriority, string> = {
  [NotificationPriority.INFO]: "Info",
  [NotificationPriority.WARNING]: "Upozorenje",
  [NotificationPriority.ERROR]: "Greška",
};

const priorityBadgeClass: Record<NotificationPriority, string> = {
  [NotificationPriority.INFO]: "badge badge--info",
  [NotificationPriority.WARNING]: "badge badge--warning",
  [NotificationPriority.ERROR]: "badge badge--error",
};

const NotificationsPage: React.FC = () => {
  const { token, user } = useAuth();
  const { notificationAPI } = useServices();
  const { unreadCount, refreshSummary } = useNotificationCenter();

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [emailLogs, setEmailLogs] = useState<NotificationEmailLogDTO[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [loadingEmailLog, setLoadingEmailLog] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [emailLogError, setEmailLogError] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const isAdmin = normalizeRole(user?.role) === "admin";

  const loadNotifications = useCallback(
    async (silent = false): Promise<void> => {
      if (!token) {
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const data = await notificationAPI.getNotifications(token, {
          ...(priorityFilter !== "ALL" ? { priority: priorityFilter } : {}),
          ...(unreadOnly ? { unreadOnly: true } : {}),
        });

        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sorted);
      } catch (requestError) {
        console.error(requestError);
        setError("Greška pri učitavanju notifikacija.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [notificationAPI, priorityFilter, token, unreadOnly]
  );

  const loadEmailLog = useCallback(async (): Promise<void> => {
    if (!token || !isAdmin) {
      return;
    }

    setLoadingEmailLog(true);
    setEmailLogError(null);

    try {
      const logs = await notificationAPI.getEmailLog(token, 25);
      setEmailLogs(logs);
    } catch (requestError) {
      console.error(requestError);
      setEmailLogError("Greška pri učitavanju email simulacije.");
    } finally {
      setLoadingEmailLog(false);
    }
  }, [isAdmin, notificationAPI, token]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadNotifications(true);
    }, 20000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadNotifications, token]);

  useEffect(() => {
    if (!isAdmin) {
      setEmailLogs([]);
      setEmailLogError(null);
      return;
    }

    void loadEmailLog();
  }, [isAdmin, loadEmailLog]);

  const unreadOnPageCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const handleMarkAsRead = async (id: number): Promise<void> => {
    if (!token) {
      return;
    }

    setMarkingId(id);
    setError(null);

    try {
      await notificationAPI.markAsRead(id, token);
      await Promise.all([loadNotifications(true), refreshSummary(true)]);
    } catch (requestError) {
      console.error(requestError);
      setError("Greška pri označavanju notifikacije kao pročitane.");
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    if (!token) {
      return;
    }

    setIsMarkingAll(true);
    setError(null);

    try {
      await notificationAPI.markAllAsRead(token);
      await Promise.all([loadNotifications(true), refreshSummary(true)]);
    } catch (requestError) {
      console.error(requestError);
      setError("Greška pri označavanju svih notifikacija kao pročitanih.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1 className="page-header__title">Notifikacioni centar</h1>
        <p className="page-header__subtitle">Automatska obaveštenja iz proizvodnje, skladišta, prodaje i bezbednosti.</p>
      </div>

      <section className="card notifications-summary-card">
        <div className="notifications-summary-card__left">
          <div className="notifications-summary-card__icon-wrap">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="card__title">Nepročitana obaveštenja</h2>
            <p className="notifications-summary-card__count">{unreadCount}</p>
          </div>
        </div>

        <div className="notifications-summary-card__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => void loadNotifications(true)}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw size={16} className={isRefreshing ? "icon-spin" : ""} />
            {isRefreshing ? "Osvežavanje..." : "Osveži"}
          </button>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void handleMarkAllAsRead()}
            disabled={isMarkingAll || unreadOnPageCount === 0}
          >
            <CheckCheck size={16} />
            {isMarkingAll ? "Obrada..." : "Označi sve kao pročitano"}
          </button>
        </div>
      </section>

      <section className="card notifications-filter-card">
        <div className="notifications-filter-card__row">
          <div className="input-group notifications-filter-card__group">
            <label className="input-group__label">
              <Filter size={14} />
              Prioritet
            </label>
            <select
              className="input select"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}
            >
              <option value="ALL">Svi prioriteti</option>
              <option value={NotificationPriority.INFO}>{priorityLabels[NotificationPriority.INFO]}</option>
              <option value={NotificationPriority.WARNING}>{priorityLabels[NotificationPriority.WARNING]}</option>
              <option value={NotificationPriority.ERROR}>{priorityLabels[NotificationPriority.ERROR]}</option>
            </select>
          </div>

          <label className="notifications-filter-card__toggle">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
            />
            Samo nepročitane
          </label>
        </div>
      </section>

      {error && <div className="storage-alert storage-alert--error">{error}</div>}

      <section className="card notifications-list-card">
        {isLoading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p className="mt-md text-muted">Učitavanje notifikacija...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <h3 className="empty-state__title">Nema notifikacija za prikaz</h3>
            <p className="empty-state__description">
              Promeni filter ili sačekaj da servisi pošalju nove event poruke.
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`notifications-item ${notification.isRead ? "notifications-item--read" : ""}`}
              >
                <header className="notifications-item__header">
                  <div className="notifications-item__title-wrap">
                    <h3 className="notifications-item__title">{notification.title}</h3>
                    <span className={priorityBadgeClass[notification.priority]}>
                      {priorityLabels[notification.priority]}
                    </span>
                    {!notification.isRead && <span className="badge badge--success">Novo</span>}
                  </div>
                  <span className="notifications-item__timestamp">
                    {formatDateTime(notification.createdAt)}
                  </span>
                </header>

                <p className="notifications-item__message">{notification.message}</p>

                <div className="notifications-item__meta">
                  <span>Event: {notification.eventType}</span>
                  <span>Servis: {notification.sourceService}</span>
                </div>

                {!notification.isRead && (
                  <div className="notifications-item__actions">
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => void handleMarkAsRead(notification.id)}
                      disabled={markingId === notification.id}
                    >
                      <Check size={16} />
                      {markingId === notification.id ? "Obrada..." : "Označi kao pročitano"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {isAdmin && (
        <section className="card notifications-email-card">
          <div className="card__header">
            <h2 className="card__title">
              <Mail size={18} className="card__title-icon" />
              Email simulacija
            </h2>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => void loadEmailLog()}
              disabled={loadingEmailLog}
            >
              <RefreshCw size={16} className={loadingEmailLog ? "icon-spin" : ""} />
              {loadingEmailLog ? "Učitavanje..." : "Osveži email log"}
            </button>
          </div>

          {emailLogError && <div className="storage-alert storage-alert--error">{emailLogError}</div>}

          <div className="notifications-email-table-wrap">
            <table className="table notifications-email-table">
              <thead>
                <tr>
                  <th>Vreme</th>
                  <th>Naslov</th>
                  <th>Cilj</th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.createdAt)}</td>
                    <td>{log.subject}</td>
                    <td>{log.targetRole ?? (log.targetUserId ? `User #${log.targetUserId}` : "-" )}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {emailLogs.length === 0 && !loadingEmailLog && (
              <p className="text-muted">Email log je trenutno prazan.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default NotificationsPage;
