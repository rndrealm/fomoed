import { useState } from "react";

type Notification = {
    id: string;
    title: string;
    description: string;
    read: boolean;
    timestamp: string;
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            title: "Welcome!",
            description: "Thanks for joining our platform.",
            read: true,
            timestamp: "Just now",
        },
        {
            id: "2",
            title: "Update",
            description: "Your profile was updated successfully.",
            read: true,
            timestamp: "1 day ago",
        },
    ]);

    const fetchNotifications = () => {
        // Placeholder: In the future, fetch from API and update state
        setNotifications([
            {
                id: "1",
                title: "Welcome!",
                description: "Thanks for joining our platform.",
                read: false,
                timestamp: "Just now",
            },
            {
                id: "2",
                title: "Update",
                description: "Your profile was updated successfully.",
                read: true,
                timestamp: "1 day ago",
            },
        ]);
    };

    return { notifications, fetchNotifications };
}
