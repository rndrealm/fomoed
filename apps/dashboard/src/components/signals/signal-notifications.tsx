import { useState, useMemo } from "react";
import { Notification } from "../icons/icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useSignalNotifications, useMarkNotificationAsRead } from "@/services/queries/signal-notifications";
import SignalNotificationIcon from "../icons/SignalNotificationIcon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function SignalNotificationsPopover() {
  const [activeTab, setActiveTab] = useState<string>("unread");
  const { data: allNotifications = [] } = useSignalNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const { readNotifications, unreadNotifications } = useMemo(() => {
    const read = allNotifications.filter(n => n.read);
    const unread = allNotifications.filter(n => !n.read);
    return { readNotifications: read, unreadNotifications: unread };
  }, [allNotifications]);

  const displayedNotifications = useMemo(() => {
    switch (activeTab) {
      case 'read':
        return readNotifications;
      case 'unread':
        return unreadNotifications;
      default:
        return allNotifications;
    }
  }, [activeTab, readNotifications, unreadNotifications, allNotifications]);

  const handleOpenChange = async (open: boolean) => {
    console.log("oooopeb:", open);
    
    if (open) {
      // Mark all unread notifications as readkgjhgjhg when opening
      if (unreadNotifications.length > 0) {
        await Promise.all(
          unreadNotifications.map(notification => 
            markAsRead(notification.id)
          )
        );
      }
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <Notification />
      </PopoverTrigger>
      <PopoverContent className="dark bg-[#0F0F0F] w-[440px] p-0 h-[565px] flex flex-col relative">
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
              className="px-3 rounded-sm"
            >
              Unread
              <div className="w-[14px] h-[14px] bg-fomoed-red rounded-xs text-[0.62rem] flex items-center justify-center shrink-0">
                {unreadNotifications.length}
              </div>
            </ToggleGroupItem>
            <ToggleGroupItem
              size={"sm"}
              value="read"
              aria-label="Toggle read"
              className="px-3 rounded-md"
            >
              Read
              <div className="w-[14px] h-[14px] bg-fomoed-red rounded-xs text-[0.62rem] flex items-center justify-center">
                {readNotifications.length}
              </div>
            </ToggleGroupItem>
            <ToggleGroupItem
              size={"sm"}
              value="all"
              aria-label="Toggle all"
              className="px-3 rounded-md"
            >
              All
              <div className="w-[14px] h-[14px] bg-fomoed-red rounded-xs text-[0.62rem] flex items-center justify-center">
                {allNotifications.length}
              </div>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator />

        <div className="h-full px-5 py-2 text-xs flex flex-col gap-4 pt-6 overflow-auto scrollbar-small-dark relative pb-14">
          {displayedNotifications.length > 0 ? (
            displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex gap-2 p-2 hover:bg-white/5 rounded-md select-none"
              >
                <div className="w-8 h-8 bg-[#1B1B1B] rounded-sm flex items-center justify-center shrink-0">
                  <SignalNotificationIcon />
                </div>
                <div className="flex flex-col ">
                  <div className="font-medium">{notification.signal_name}</div>
                  <div className="text-xs text-[#808080]">
                    {notification.description}
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  <div className="text-xs text-[#808080] text-end">
                    {dayjs(notification.created_at).fromNow()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-center">
              Your smart signal notifications <br /> will appear here.
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
