import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { LoaderCircle, Settings, Wand } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
// import AISignalBuilder from "./AISignalBuilder";
import useUserData from "@/lib/hooks/use-user-data";
import { CreateSignalDTO, SignalActions } from "@/lib/types/signal.types";
import { extractTopicsFromJsonLogic } from "@/lib/utils/signal.utils";
import { useCreateSignalMutation } from "@/services/queries/signals";
import { redirect } from "next/navigation";
import ManualSignalBuilder from "./manual-signal-builder";
import NotificationSettings from "./notification-settings";
import SignalDetails from "./signal-details";

const SignalBuilder = ({}) => {
  const [buildMode, setBuildMode] = useState<string>("manual");
  const [signalName, setSignalName] = useState("");
  const [signalDescription, setSignalDescription] = useState("");
  const [condition, setCondition] = useState<object | null>(null);
  const [signalActions, setSignalActions] = useState<SignalActions>({
    email: true,
    notification: true,
  });

  const user = useUserData();

  const { mutateAsync: createSignal, isPending } = useCreateSignalMutation();

  const handleSave = async () => {
    if (!condition || !user?.user_id) return;

    if (signalName.length === 0 || signalDescription.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }
    const actions: object[] = [];

    if (signalActions.email)
      actions.push({
        type: "email",
        subject: `Smart Signal fired: ${signalName}`,
        content: `Your smart signal ${signalName} from fomoed.io has been triggered`,
      });

    if (signalActions.notification)
      actions.push({
        type: "notification",
        description: `Your smart signal ${signalName} from fomoed.io has been triggered`,
      });

    const data: CreateSignalDTO = {
      name: signalName,
      description: signalDescription,
      condition: JSON.stringify(condition),
      topics: extractTopicsFromJsonLogic(condition),
      user_id: user?.id,

      // actions?
      actions,
    };

    await createSignal(data);
    toast.success("Signal saved successfully");
    redirect("/signals");
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
        <ManualSignalBuilder logic={condition} setLogic={setCondition} />
      )}

      <NotificationSettings
        notifications={signalActions}
        onUpdate={setSignalActions}
      />

      <SignalDetails
        name={signalName}
        description={signalDescription}
        onNameChange={setSignalName}
        onDescriptionChange={setSignalDescription}
      />

      <div className="flex justify-end gap-3">
        <Button disabled={isPending} onClick={handleSave}>
          {isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Save Signal
        </Button>
      </div>
    </div>
  );
};

export default SignalBuilder;
