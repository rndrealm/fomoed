"use client";
import { Button } from "@/components/ui/button";

import { LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
// import AISignalBuilder from "./AISignalBuilder";
import useUserData from "@/lib/hooks/use-user-data";
import { SignalActions } from "@/lib/types/signal.types";
import { extractTopicsFromJsonLogic } from "@/lib/utils/signal.utils";
import {
  useCreateSignalMutation,
  useGetAISignal,
  useSmartSignals,
} from "@/services/queries/signals";
import { CreateSignalDTO } from "@/services/queries/signals/types";
import { redirect, useRouter } from "next/navigation";
import AISignalPromptInput from "./ai-builder-prompt-input";
import ManualSignalBuilder from "./manual-signal-builder";
import NotificationSettings from "./notification-settings";
import SignalDetails from "./signal-details";
import { useAtom } from "jotai";
import { activeSignalTabAtom } from "@/lib/atoms/signalTabsAtom";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { ModalContainer } from "../shared";
import { Upgrade } from "../modals";
import SignalTitle from "./signal-title";
import AutoGenerateButton from "./auto-generate-btn";

const SignalBuilder = ({}) => {
  const [signalPrompt, setSignalPrompt] = useState("");
  const [signalDescription, setSignalDescription] = useState("");
  const [logic, setLogic] = useState<object | null>(null);
  const [signalActions, setSignalActions] = useState<SignalActions>({
    email: true,
    notification: true,
  });
  const { data: smartSignals = [] } = useSmartSignals();

  const [updateCount, setUpdateCount] = useState(0);
  const [_, setActiveSignalTab] = useAtom(activeSignalTabAtom);

  const user = useUserData();
  const { data: userPlanData } = useGetUserPlans();

  const { mutateAsync: createSignal, isPending } = useCreateSignalMutation();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleAIBuilderResponse = (
    name: string,
    description: string,
    logic: object,
  ) => {
    setSignalPrompt(name);
    setSignalDescription(description);
    setLogic(logic);
    setUpdateCount((prev) => prev + 1);
  };

  useEffect(() => {
    console.log("🚀 ~ SignalBuilder ~ condition:", logic);
  }, [logic]);

  const handleSave = async () => {
    if (!logic || !user?.user_id) return;

    if (userPlanData?.planType === "FREE" && smartSignals.length >= 2) {
      setShowUpgradeModal(true);
      return;
    }

    if (signalPrompt.length === 0 || signalDescription.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }
    const actions: Array<{
      type: string;
      subject?: string;
      content?: string;
      description?: string;
    }> = [];

    if (signalActions.email)
      actions.push({
        type: "email",
        subject: `Smart Signal fired: ${signalPrompt}`,
        content: `Your smart signal "${signalPrompt}" from fomoed.io has been triggered`,
      });

    if (signalActions.notification)
      actions.push({
        type: "notification",
        description: `Your smart signal "${signalPrompt}" from fomoed.io has been triggered`,
      });

    const data: CreateSignalDTO = {
      name: signalPrompt,
      description: signalDescription,
      condition: JSON.stringify(logic),
      topics: extractTopicsFromJsonLogic(logic),
      user_id: user?.id,

      // actions?
      actions,
    };

    await createSignal(data);
    toast.success("Signal saved successfully");
    setActiveSignalTab("my-signals");
  };

  // Auto generate
  const { mutateAsync: getAiSignal, isPending: isPendingAutoGenerate } =
    useGetAISignal();

  const autoGenerate = useCallback(async () => {
    const res = await getAiSignal(signalPrompt);
    console.log(res);

    if (!res.success || !res.signal) {
      toast.error("Failed to generate signal. Please try again.");
      return;
    }

    handleAIBuilderResponse(
      res.signal.name,
      res.signal.description,
      res.signal.condition,
    );
  }, [signalPrompt, getAiSignal]);

  return (
    <>
      <div className="my-6">
        {/* <h1 className="font-medium text-xl mt-5">Signal Conditions</h1>
        <h2 className="font-medium text-muted-foreground">
          Build your Smart signals
        </h2> */}
      </div>
      <div className="space-y-6">
        {/* <SignalDetails
          name={signalName}
          description={signalDescription}
          onNameChange={setSignalName}
          onDescriptionChange={setSignalDescription}
          jsonLogic={logic}
        /> */}

        <div className="px-4">
          <SignalTitle title={signalPrompt} onTitleChange={setSignalPrompt}>
            <AutoGenerateButton
              onClick={autoGenerate}
              isPending={isPendingAutoGenerate}
            />
          </SignalTitle>
        </div>

        {/* <AISignalPromptInput onAiPromptResponse={handleAIBuilderResponse} /> */}

        <ManualSignalBuilder
          key={updateCount}
          initialLogic={logic}
          setLogic={setLogic}
        />

        <NotificationSettings
          notifications={signalActions}
          onUpdate={setSignalActions}
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

        <ModalContainer
          open={showUpgradeModal}
          handleClose={() => {
            setShowUpgradeModal(false);
          }}
          noHeader
          className="!max-w-[410px] !p-0 rounded-[24px]"
        >
          <Upgrade
            plan={userPlanData?.planType}
            handleClose={() => {
              setShowUpgradeModal(false);
            }}
          />
        </ModalContainer>
      </div>
    </>
  );
};

export default SignalBuilder;
