"use client";
import { Button } from "@/components/ui/button";

import { Check, LoaderCircle } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useUserData from "@/lib/hooks/use-user-data";
import { SignalActions } from "@/lib/types/signal.types";
import {
  fetchGenerateSignal,
  useCreateSignalMutation,
  useGenerateSignalDetails,
  useSmartSignals,
} from "@/services/queries/signals";
import {
  CreateSignalDTO,
  GetAiSignalResponseBody,
} from "@/services/queries/signals/types";
import ManualSignalBuilder from "./manual-signal-builder";
import NotificationSettings from "./notification-settings";
import { useAtom } from "jotai";
import { activeSignalTabAtom } from "@/lib/atoms/signalTabsAtom";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { ModalContainer, RenderIf } from "../shared";
import { Upgrade } from "../modals";
import SignalTitle from "./signal-title";
import AutoGenerateButton from "./auto-generate-btn";
import { Group, defaultGroup } from "./condition-group";
import {
  isConditionGroupValid,
  jsonLogicToGroup,
  toJsonLogic,
} from "@/lib/utils/signal.utils";
import { SignalGenErrorBox } from "./signal-gen-error-box";
import { useMutation } from "@tanstack/react-query";
import { useCall } from "wagmi";
import clsx from "clsx";

const SignalBuilder = ({}) => {
  const [signalPrompt, setSignalPrompt] = useState("");
  const [signalDescription, setSignalDescription] = useState("");
  const [rootGroup, setRootGroup] = useState<Group>(defaultGroup(0));
  const [signalActions, setSignalActions] = useState<SignalActions>({
    email: true,
    notification: true,
  });
  const { data: smartSignals = [] } = useSmartSignals();

  // Convert group to JSON logic
  const logic = useMemo(() => toJsonLogic(rootGroup), [rootGroup]);

  const [updateCount, setUpdateCount] = useState(0);
  const [_, setActiveSignalTab] = useAtom(activeSignalTabAtom);

  const user = useUserData();
  const { data: userPlanData } = useGetUserPlans();

  const { mutateAsync: createSignal, isPending } = useCreateSignalMutation();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSave = async () => {
    if (!rootGroup || !user?.user_id) return;

    if (userPlanData?.planType === "FREE" && smartSignals.length >= 2) {
      setShowUpgradeModal(true);
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
      name: signalPrompt || JSON.stringify(logic),
      description: signalDescription,
      condition: JSON.stringify(logic),
      user_id: user?.id,

      // actions?
      actions,
    };

    console.log({ data });

    await createSignal(data);
    toast.success("Signal saved successfully");
    setActiveSignalTab("my-signals");
  };

  const latestSubmittedPrompt = useRef<string>("");
  const feedbackId = useRef<number | null>(null);

  const onGenerateSuccess = useCallback((data: GetAiSignalResponseBody) => {
    if (!data.success || !data.signal) {
      toast.error("Failed to generate signal. Please try again.");
      return;
    }

    const newRootGroup = data.signal.condition
      ? jsonLogicToGroup(data.signal.condition)
      : defaultGroup(0);

    setSignalPrompt(data.signal.name);
    setSignalDescription(data.signal.description);
    setRootGroup(newRootGroup);
    setIsRootGroupValid(isConditionGroupValid(newRootGroup));
    setUpdateCount((prev) => prev + 1);
  }, []);

  const generateSignalMutationFn = async () => {
    latestSubmittedPrompt.current = signalPrompt;
    return await fetchGenerateSignal(signalPrompt);
  };

  // Auto generate mutation
  const {
    mutate: mutateGenerateSignal,
    isPending: isPendingAutoGenerate,
    isError: isAutoGenerateError,
    error: autoGenerateError,
  } = useMutation({
    mutationFn: generateSignalMutationFn,
    onSuccess: onGenerateSuccess,
    onError: (err: any) => {
      const error = err as GetAiSignalResponseBody;

      if (error.error === "cannot-generate") {
        feedbackId.current = error.feedbackId || null;
      }
    },
  });

  const [isRootGroupValid, setIsRootGroupValid] = useState(false);

  // Auto generate signal title if condition is valid and the logic stays
  // the same for some amount of time
  const genDetailsMutation = useGenerateSignalDetails();

  const generateDelay = 500;

  const generateSignalDetails = useCallback(
    async (currentLogic: any) => {
      if (!isRootGroupValid) return;

      const res = await genDetailsMutation.mutateAsync(currentLogic);
      setSignalPrompt(res.signal.name);
    },
    [isRootGroupValid, genDetailsMutation],
  );

  const debouncedGenerateDetails = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return (currentLogic: any) => {
      clearTimeout(timeoutId);
      if (isRootGroupValid) {
        timeoutId = setTimeout(
          () => generateSignalDetails(currentLogic),
          generateDelay,
        );
      }
    };
  }, [generateSignalDetails, generateDelay, isRootGroupValid]);

  const onRootGroupChange = useCallback(
    (rootGroup: Group) => {
      setRootGroup(rootGroup);
      const isValid = isConditionGroupValid(rootGroup);
      setIsRootGroupValid(isValid);

      if (isValid) {
        const newLogic = toJsonLogic(rootGroup);
        debouncedGenerateDetails(newLogic);
      }
    },
    [debouncedGenerateDetails],
  );

  const [isLongPrompt, setIsLongPrompt] = useState(false);

  const handlePromptRowCountChange = useCallback(
    (rowCount: number) => {
      if (isLongPrompt) return;

      setIsLongPrompt(rowCount > 1);
    },
    [setIsLongPrompt, isLongPrompt],
  );

  return (
    <div className="flex flex-col gap-3 min-h-max justify-center pb-24">
      <div
        className={clsx("flex items-center gap-x-2 gap-y-2", {
          "flex-col items-end": isLongPrompt,
        })}
      >
        <div className="w-full">
          <SignalTitle
            title={signalPrompt}
            onTitleChange={setSignalPrompt}
            loading={genDetailsMutation.isPending}
            onRowCountChange={handlePromptRowCountChange}
          ></SignalTitle>
        </div>

        <AutoGenerateButton
          onClick={mutateGenerateSignal}
          isPending={isPendingAutoGenerate}
          tall={!isLongPrompt}
        />
      </div>

      <RenderIf condition={isAutoGenerateError}>
        <SignalGenErrorBox
          latestPrompt={signalPrompt}
          reason={autoGenerateError?.message || "Unexpected error"}
          feedbackId={feedbackId.current}
        />
      </RenderIf>

      <ManualSignalBuilder
        key={updateCount}
        rootGroup={rootGroup}
        onRootGroupChange={onRootGroupChange}
      />

      <NotificationSettings
        notifications={signalActions}
        onUpdate={setSignalActions}
      />

      <div className="flex justify-end gap-3">
        <Button
          className="bg-fomoed-red text-white hover:bg-fomoed-red/80 font-semibold flex w-24"
          disabled={isPending || !isRootGroupValid}
          onClick={handleSave}
        >
          Save
          {(isPending && <LoaderCircle className="animate-spin" />) || (
            <Check className="w-4" />
          )}
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
  );
};

export default SignalBuilder;
