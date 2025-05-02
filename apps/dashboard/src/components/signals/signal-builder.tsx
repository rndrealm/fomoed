import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SignalDefinition } from "@/lib/types/signal.types";
import { generateId, isConditionGroupValid } from "@/lib/utils/signal.utils";
import { Settings, Wand } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
// import AISignalBuilder from "./AISignalBuilder";
import AISignalBuilder from "./ai-builder";
import ManualSignalBuilder from "./manual-signal-builder";
import NotificationSettings from "./notification-settings";
import SignalDetails from "./signal-details";

interface SignalBuilderProps {
  initialSignal?: SignalDefinition;
  onSave: (signal: SignalDefinition) => void;
  onCancel?: () => void;
}

const SignalBuilder: React.FC<SignalBuilderProps> = ({
  initialSignal,
  onSave,
  onCancel,
}) => {
  const [signal, setSignal] = useState<SignalDefinition>(
    initialSignal || {
      id: generateId(),
      name: "",
      description: "",
      rootCondition: {
        id: "root",
        type: "group",
        operator: "AND",
        conditions: [
          {
            id: generateId(),
            type: "simple",
            dataSource: "",
            operator: "",
            value: "",
          },
        ],
      },
      notifications: {
        email: true,
        inApp: true,
      },
      primaryAssetPair: "btc-usdt", // Default asset pair
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [
        {
          type: "email",
          subject: "Price Alert",
          content: "Your price alert triggered!",
        },
        {
          type: "notification",
          description: "BTC price target reached",
        },
      ],
    }
  );

  const [buildMode, setBuildMode] = useState<string>("manual");

  const handleRootConditionUpdate = (updatedRoot: any) => {
    setSignal({ ...signal, rootCondition: updatedRoot });
  };

  const handleNotificationsUpdate = (updatedNotifications: any) => {
    setSignal({ ...signal, notifications: updatedNotifications });
  };

  const handleUpdateSignal = (updatedSignal: SignalDefinition) => {
    setSignal(updatedSignal);
  };

  const handleUpdatePrimaryAssetPair = (assetPair: string) => {
    setSignal({ ...signal, primaryAssetPair: assetPair });
  };

  const handleSave = () => {
    // Validate the signal
    if (!signal.name.trim()) {
      toast.error("Signal name is required");
      return;
    }

    if (!isConditionGroupValid(signal.rootCondition)) {
      toast.error("Please complete all conditions before saving");
      return;
    }

    // Add timestamps
    const updatedSignal = {
      ...signal,
      updatedAt: new Date().toISOString(),
    };

    // Convert rootCondition to JSON Logic schema

    onSave(updatedSignal);
    toast.success("Signal saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <ToggleGroup
          type="single"
          value={buildMode}
          onValueChange={(value) => value && setBuildMode(value)}
          className="border rounded-lg"
        >
          <ToggleGroupItem
            value="manual"
            aria-label="Toggle manual mode"
            className="px-6 py-2 data-[state=on]:bg-fomoed-red data-[state=on]:text-white"
          >
            <Settings className="mr-2 h-4 w-4" />
            Manual Builder
          </ToggleGroupItem>
          <ToggleGroupItem
            value="ai"
            aria-label="Toggle AI mode"
            className="px-6 py-2 data-[state=on]:bg-fomoed-red data-[state=on]:text-white"
          >
            <Wand className="mr-2 h-4 w-4" />
            AI Builder
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Building Frame */}
      {buildMode === "ai" ? (
        <>
          <AISignalBuilder
            signal={signal}
            onUpdateSignal={handleUpdateSignal}
          />
        </>
      ) : (
        <ManualSignalBuilder
          rootCondition={signal.rootCondition}
          onUpdateRootCondition={handleRootConditionUpdate}
          primaryAssetPair={signal.primaryAssetPair || "btc-usdt"}
          onUpdatePrimaryAssetPair={handleUpdatePrimaryAssetPair}
        />
      )}

      <NotificationSettings
        notifications={signal.notifications}
        onUpdate={handleNotificationsUpdate}
      />

      {/* Signal Details Frame */}
      <SignalDetails signal={signal} onUpdateSignal={handleUpdateSignal} />

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave}>Save Signal</Button>
      </div>
    </div>
  );
};

export default SignalBuilder;
