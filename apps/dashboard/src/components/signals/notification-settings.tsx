import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SignalActions } from "@/lib/types/signal.types";
import React from "react";

interface NotificationSettingsProps {
  notifications: SignalActions;
  onUpdate: (notifications: SignalActions) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notifications,
  onUpdate,
}) => {
  const handleEmailToggle = () => {
    onUpdate({
      ...notifications,
      email: !notifications.email,
    });
  };

  const handleInAppToggle = () => {
    onUpdate({
      ...notifications,
      notification: !notifications.notification,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Notification Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive alerts via email when this signal is triggered
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={notifications.email}
              onCheckedChange={handleEmailToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="app-notifications">In-App Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive alerts within the application
              </div>
            </div>
            <Switch
              id="app-notifications"
              checked={notifications.notification}
              onCheckedChange={handleInAppToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
