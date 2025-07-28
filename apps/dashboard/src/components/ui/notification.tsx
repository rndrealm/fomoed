import SignalNotificationIcon from "../icons/SignalNotificationIcon";
import dayjs from "dayjs";
import { NotificationRow } from "@/services/queries/signal-notifications";

interface NotificationItemProps {
  notification: NotificationRow;
  unread?: boolean;
}

export function NotificationItem({
  notification,
  unread,
}: NotificationItemProps) {
  return (
    <div className="flex gap-3 p-4 hover:bg-white/5 rounded-md select-none">
      <div
        className={
          `w-8 h-8 rounded-sm flex items-center justify-center shrink-0 bg-[#1B1B1B]` +
          (unread ? " border border-fomoed-red" : "")
        }
      >
        <SignalNotificationIcon />
      </div>

      <div className="flex flex-col w-full">
        <div className="font-medium">{notification.signal_name}</div>
        <div className="text-xs text-[#808080] mt-1">
          {notification.description}
        </div>
      </div>

      <div className="flex justify-end items-center">
        <div className="text-xs text-[#808080] text-end whitespace-nowrap">
          {dayjs(notification.created_at).fromNow()}
        </div>
      </div>
    </div>
  );
}
