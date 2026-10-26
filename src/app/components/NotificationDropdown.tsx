import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Bell, Check, Home, AlertCircle, DollarSign } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "payment";
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New Tenant Request",
    message: "John Doe has submitted an application for Sunset Apartments Unit 4B",
    time: "5 min ago",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "Maintenance Alert",
    message: "Maintenance request submitted for Harbor View Residences - Elevator issue",
    time: "1 hour ago",
    read: false,
    type: "warning",
  },
  {
    id: "3",
    title: "Payment Received",
    message: "Rent payment of $2,500 received for Downtown Lofts Unit 12A",
    time: "2 hours ago",
    read: false,
    type: "payment",
  },
  {
    id: "4",
    title: "Lease Expiring Soon",
    message: "Lease for Sunset Apartments Unit 3C expires in 30 days",
    time: "1 day ago",
    read: true,
    type: "info",
  },
  {
    id: "5",
    title: "Payment Received",
    message: "Rent payment of $1,800 received for Harbor View Residences Unit 7B",
    time: "2 days ago",
    read: true,
    type: "payment",
  },
];

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Home className="size-4 text-blue-500" />;
      case "warning":
        return <AlertCircle className="size-4 text-orange-500" />;
      case "payment":
        return <DollarSign className="size-4 text-green-500" />;
      default:
        return <Bell className="size-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative inline-flex items-center justify-center size-10 rounded-md text-white hover:bg-blue-700 transition-colors">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-0 hover:bg-transparent hover:underline"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="size-12 mb-2 opacity-20" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-neutral-50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={!notification.read ? "" : "text-muted-foreground"}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="size-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-center hover:bg-neutral-100"
                onClick={() => {
                  setIsOpen(false);
                  console.log("View all notifications");
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
