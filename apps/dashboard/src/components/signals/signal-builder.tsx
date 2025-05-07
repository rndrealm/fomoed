import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SignalDefinition } from "@/lib/types/signal.types";
import { Settings, Wand } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
// import AISignalBuilder from "./AISignalBuilder";
import ManualSignalBuilder from "./manual-signal-builder";
import NotificationSettings from "./notification-settings";

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
  const [buildMode, setBuildMode] = useState<string>("manual");

  const handleSave = () => {
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
          {/* <AISignalBuilder
            signal={signal}
            onUpdateSignal={handleUpdateSignal}
          /> */}
          AI BUILDER
        </>
      ) : (
        <ManualSignalBuilder />
      )}

      <NotificationSettings
        notifications={{ email: false, inApp: false }}
        onUpdate={() => {}}
      />

      {/* Signal Details Frame */}
      {/* <SignalDetails signal={signal} onUpdateSignal={handleUpdateSignal} /> */}

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
