import { Bell } from "lucide-react";
import { useNotifications } from "./hooks/useNotifications";

// NotificationItem component
const NotificationItem = ({
    title,
    description,
    timestamp,
    isNew = false,
}: {
    title: string;
    description: string;
    timestamp: string;
    isNew?: boolean;
}) => (
    <div className="flex items-start p-4 rounded-md border border-[#333333] bg-[#222222] hover:bg-[#2A2A2A] transition-colors">
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
            <span className="text-xs text-gray-500 pt-2 block">{timestamp}</span>
        </div>
    </div>
);

export default function NotificationList() {
    const { notifications } = useNotifications();

    return (
        <>
            <h2 className="text-lg font-semibold pb-4 flex items-center text-white">
                <Bell size={18} className="text-orange-500" />
                <div className="pl-2">Notifications</div>
            </h2>
            <div className="space-y-2">
                {notifications.map((n) => (
                    <NotificationItem
                        key={n.id}
                        title={n.title}
                        description={n.description}
                        timestamp={n.timestamp}
                        isNew={!n.read}
                    />
                ))}
            </div>
        </>
    );
}
