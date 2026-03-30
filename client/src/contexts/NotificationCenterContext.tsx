import React, { ReactNode, createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServices } from "./ServiceContext";
import { useAuth } from "../hooks/useAuthHook";
import { NotificationDTO } from "../models/notification/NotificationDTO";

const POLL_INTERVAL_MS = 20000;
const MAX_LATEST_UNREAD = 6;
const MAX_TOASTS = 3;

export type NotificationCenterContextType = {
  latestUnread: NotificationDTO[];
  unreadCount: number;
  toastQueue: NotificationDTO[];
  isLoading: boolean;
  error: string | null;
  refreshSummary: (silent?: boolean) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissToast: (id: number) => void;
};

const NotificationCenterContext = createContext<NotificationCenterContextType | undefined>(undefined);

export const NotificationCenterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const { notificationAPI } = useServices();

  const [latestUnread, setLatestUnread] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastQueue, setToastQueue] = useState<NotificationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const knownUnreadIdsRef = useRef<Set<number>>(new Set());
  const isFirstLoadRef = useRef(true);

  const refreshSummary = useCallback(
    async (silent = false): Promise<void> => {
      if (!token) {
        setLatestUnread([]);
        setUnreadCount(0);
        setToastQueue([]);
        setError(null);
        knownUnreadIdsRef.current = new Set();
        isFirstLoadRef.current = true;
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const [count, unreadNotifications] = await Promise.all([
          notificationAPI.getUnreadCount(token),
          notificationAPI.getNotifications(token, { unreadOnly: true }),
        ]);

        const sortedUnread = [...unreadNotifications].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setUnreadCount(count);
        setLatestUnread(sortedUnread.slice(0, MAX_LATEST_UNREAD));

        const knownIds = knownUnreadIdsRef.current;
        const newlyArrived = sortedUnread.filter((notification) => !knownIds.has(notification.id));

        if (!isFirstLoadRef.current && newlyArrived.length > 0) {
          setToastQueue((previous) => {
            const next = [...newlyArrived, ...previous];
            const unique = next.filter(
              (notification, index, array) =>
                array.findIndex((candidate) => candidate.id === notification.id) === index
            );
            return unique.slice(0, MAX_TOASTS);
          });
        }

        knownUnreadIdsRef.current = new Set(sortedUnread.map((notification) => notification.id));
        isFirstLoadRef.current = false;
      } catch (requestError) {
        console.error(requestError);
        setError("Greška pri osvežavanju notifikacija.");
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [notificationAPI, token]
  );

  const markAsRead = useCallback(
    async (id: number): Promise<void> => {
      if (!token) {
        return;
      }

      await notificationAPI.markAsRead(id, token);
      setToastQueue((previous) => previous.filter((item) => item.id !== id));
      await refreshSummary(true);
    },
    [notificationAPI, refreshSummary, token]
  );

  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!token) {
      return;
    }

    await notificationAPI.markAllAsRead(token);
    setToastQueue([]);
    await refreshSummary(true);
  }, [notificationAPI, refreshSummary, token]);

  const dismissToast = useCallback((id: number) => {
    setToastQueue((previous) => previous.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    void refreshSummary();
  }, [refreshSummary]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshSummary(true);
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshSummary, token]);

  const contextValue = useMemo<NotificationCenterContextType>(
    () => ({
      latestUnread,
      unreadCount,
      toastQueue,
      isLoading,
      error,
      refreshSummary,
      markAsRead,
      markAllAsRead,
      dismissToast,
    }),
    [dismissToast, error, isLoading, latestUnread, markAllAsRead, markAsRead, refreshSummary, toastQueue, unreadCount]
  );

  return (
    <NotificationCenterContext.Provider value={contextValue}>
      {children}
    </NotificationCenterContext.Provider>
  );
};

export default NotificationCenterContext;
