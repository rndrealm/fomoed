import { useState, useMemo } from "react";
import { Notification } from "../icons/icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  useSignalNotifications,
  useMarkNotificationAsRead,
  NotificationRow,
} from "@/services/queries/signal-notifications";
import SignalNotificationIcon from "../icons/SignalNotificationIcon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { NotificationItem } from "../ui/notification";

dayjs.extend(relativeTime);

function SignalNotificationsPopover() {
  const [activeTab, setActiveTab] = useState<string>("unread");
  const { data } = useSignalNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const allNotifications = useMemo(
    () => (data || []) as NotificationRow[],
    [data],
  );

  const { readNotifications, unreadNotifications } = useMemo(() => {
    const read = allNotifications.filter((n) => n.read);
    const unread = allNotifications.filter((n) => !n.read);
    return { readNotifications: read, unreadNotifications: unread };
  }, [allNotifications]);

  const displayedNotifications = useMemo(() => {
    switch (activeTab) {
      case "read":
        return readNotifications;
      case "unread":
        return unreadNotifications;
      default:
        return allNotifications;
    }
  }, [activeTab, readNotifications, unreadNotifications, allNotifications]);

  const handleOpenChange = async (open: boolean) => {
    if (!open) {
      // mark as read on close
      if (unreadNotifications.length > 0) {
        await Promise.all(
          unreadNotifications.map((notification: NotificationRow) =>
            markAsRead(notification.id),
          ),
        );
      }
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <div className="relative">
          <Notification />
          {unreadNotifications.length > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-fomoed-red rounded-full" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="dark bg-[#0F0F0F] w-[440px] p-0 h-[565px] flex flex-col relative mr-4 transform translate-x-6 translate-y-3"
        align="end"
      >
        <div className="p-5">
          <div className="font-medium text-lg">Notifications</div>
        </div>

        <Separator />

        <div className="px-5 py-2 text-xs">
          <ToggleGroup
            type="single"
            value={activeTab}
            onValueChange={setActiveTab}
            className="gap-1"
          >
            <ToggleGroupItem
              size={"sm"}
              value="unread"
              aria-label="Toggle unread"
              className="px-5 rounded-sm"
            >
              Unread
              {/* <div className="w-[14px] h-[14px] bg-fomoed-red rounded-xs text-[0.62rem] flex items-center justify-center shrink-0">
                {unreadNotifications.length}
              </div> */}
            </ToggleGroupItem>

            <ToggleGroupItem
              size={"sm"}
              value="read"
              aria-label="Toggle read"
              className="px-3 rounded-md"
            >
              Read
              {/* <div className="w-[14px] h-[14px] bg-fomoed-red rounded-xs text-[0.62rem] flex items-center justify-center">
                {readNotifications.length}
              </div> */}
            </ToggleGroupItem>

            <ToggleGroupItem
              size={"sm"}
              value="all"
              aria-label="Toggle all"
              className="px-3 rounded-md"
            >
              All
              {/* <div className="w-[14px] h-[14px] bg-fomoed-red rounded-xs text-[0.62rem] flex items-center justify-center">
                {allNotifications.length}
              </div> */}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator />

        <div className="h-full px-2 py-2 text-xs flex flex-col gap-1 pt-6 overflow-auto scrollbar-small-dark relative pb-14">
          {displayedNotifications.length > 0 ? (
            displayedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                unread={!notification.read}
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-center text-base text-white/30">
              Your smart signal and other notifications <br /> will appear here.
            </div>
          )}
        </div>

        {displayedNotifications.length > 5 && (
          <div
            className="w-full h-14 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F] to-transparent absolute 
        bottom-0 left-0 right-0 z-10 text-center flex justify-center items-end pb-2"
          >
            <div className="text-xs text-white underline">View More</div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default SignalNotificationsPopover;
