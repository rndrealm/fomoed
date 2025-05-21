"use client";
import { Button } from "@/components/ui/button";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// import AISignalBuilder from "./AISignalBuilder";
import useUserData from "@/lib/hooks/use-user-data";
import { SignalActions } from "@/lib/types/signal.types";
import { extractTopicsFromJsonLogic } from "@/lib/utils/signal.utils";
import { useCreateSignalMutation } from "@/services/queries/signals";
import { CreateSignalDTO } from "@/services/queries/signals/types";
import { redirect } from "next/navigation";
import AISignalPromptInput from "./ai-builder-prompt-input";
import ManualSignalBuilder from "./manual-signal-builder";
import NotificationSettings from "./notification-settings";
import SignalDetails from "./signal-details";

const SignalBuilder = ({}) => {
  const [buildMode, setBuildMode] = useState<string>("manual");
  const [signalName, setSignalName] = useState("");
  const [signalDescription, setSignalDescription] = useState("");
  const [logic, setLogic] = useState<object | null>(null);
  const [signalActions, setSignalActions] = useState<SignalActions>({
    email: true,
    notification: true,
  });
  const [updateCount, setUpdateCount] = useState(0);

  const user = useUserData();

  const { mutateAsync: createSignal, isPending } = useCreateSignalMutation();

  const handleBasicDetailsUpdate = (name: string, description: string) => {
    setSignalName(name);
    setSignalDescription(description);
  };

  const handleAIBuilderResponse = (
    name: string,
    description: string,
    logic: object
  ) => {
    setSignalName(name);
    setSignalDescription(description);
    setLogic(logic);
    setUpdateCount((prev) => prev + 1);
  };

  useEffect(() => {
    console.log("🚀 ~ SignalBuilder ~ condition:", logic);
  }, [logic]);

  const handleSave = async () => {
    if (!logic || !user?.user_id) return;

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
      condition: JSON.stringify(logic),
      topics: extractTopicsFromJsonLogic(logic),
      user_id: user?.id,

      // actions?
      actions,
    };

    await createSignal(data);
    toast.success("Signal saved successfully");
    redirect("/signals");
  };

  return (
    <>
      <div className="my-6">
        <h1 className="font-medium text-xl mt-5">Signal Conditions</h1>
        <h2 className="font-medium text-muted-foreground">
          Build your Smart signals
        </h2>
      </div>
      <div className="space-y-6">
        <AISignalPromptInput onAiPromptResponse={handleAIBuilderResponse} />

        <ManualSignalBuilder
          key={updateCount}
          initialLogic={logic}
          setLogic={setLogic}
        />

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
          <Button
            className="bg-fomoed-red text-white hover:bg-fomoed-red/80"
            disabled={isPending}
            onClick={handleSave}
          >
            {isPending && (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Signal
          </Button>
        </div>
      </div>
    </>
  );
};

export default SignalBuilder;
