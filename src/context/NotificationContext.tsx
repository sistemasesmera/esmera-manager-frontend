import { createContext, useContext, useState, ReactNode } from "react";
import Notification from "../components/ui/notification/Notfication";

type Notification = {
  id: number;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
};

interface NotificationContextType {
  showNotification: (
    type: Notification["type"],
    title: string,
    message: string
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (
    type: Notification["type"],
    title: string,
    message: string
  ) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-[999999] bg-white">
        {notifications.map((n) => (
          <Notification
            key={n.id}
            title={n.title}
            description={n.message}
            variant={n.type}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotification debe usarse dentro de NotificationProvider"
    );
  return context;
}
