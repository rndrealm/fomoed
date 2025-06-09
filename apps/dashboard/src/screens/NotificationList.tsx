import { Bell, Trash } from "lucide-react";
import { useAtom } from "jotai";
import { notificationsAtom, useNotifications } from "./hooks/use-notifications";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import React from "react";

// NotificationItem component
const NotificationItem = ({
    title,
    description,
    timestamp,
    isNew = false,
    onDelete,
    deleting = false,
}: {
    title: string;
    description: string;
    timestamp: string;
    isNew?: boolean;
    onDelete?: () => void;
    deleting?: boolean;
}) => (
    <div className="group flex items-start p-4 rounded-md border border-[#333333] bg-[#222222] hover:bg-[#2A2A2A] transition-colors relative">
        <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
            <Bell size={16} />
        </div>
        <div className="flex-1 pl-3">
            <div className="flex items-center">
                <h3 className="font-medium text-white">{title}</h3>
                {isNew && (
                    <span className="pl-2 px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-500 rounded-full">
                        New
                    </span>
                )}
            </div>
            <p className="text-gray-400 text-sm pt-1">{description}</p>
            <span className="text-xs text-gray-500 pt-2 block">{dayjs(timestamp).format("DD MMM YYYY, HH:mm")}</span>
        </div>
        {onDelete && (
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                onClick={onDelete}
                aria-label="Delete notification"
                disabled={deleting}
            >
                <Trash className="text-red-500" />
            </Button>
        )}
    </div>
);

export default function NotificationList() {
    const [notifications] = useAtom(notificationsAtom);
    const { deleteNotification } = useNotifications();
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        await deleteNotification(id);
        setDeletingId(null);
    };

    return (
        <>
            <div className="text-lg font-semibold flex items-center text-white h-16">
                <Bell size={18} className="text-orange-500" />
                <div className="pl-2 grid place-items-center">Notifications</div>
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-[#232323] rounded-md border border-[#333333] text-gray-400">
                    <span className="text-base font-medium">No notifications</span>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <NotificationItem
                            key={n.id}
                            title={n.description}
                            description={""}
                            timestamp={n.created_at}
                            onDelete={() => handleDelete(n.id)}
                            deleting={deletingId === n.id}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
