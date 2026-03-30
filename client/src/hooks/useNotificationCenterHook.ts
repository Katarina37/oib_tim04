import { useContext } from "react";
import NotificationCenterContext, {
  NotificationCenterContextType,
} from "../contexts/NotificationCenterContext";

export const useNotificationCenter = (): NotificationCenterContextType => {
  const context = useContext(NotificationCenterContext);

  if (!context) {
    throw new Error("useNotificationCenter must be used inside NotificationCenterProvider");
  }

  return context;
};
