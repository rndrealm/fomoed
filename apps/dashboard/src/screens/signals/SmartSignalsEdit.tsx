"use client";
import ManualSignalBuilder from "@/components/signals/manual-signal-builder";
import NotificationSettings from "@/components/signals/notification-settings";
import SignalDetails from "@/components/signals/signal-details";
import { Button } from "@/components/ui/button";
import useUserData from "@/lib/hooks/use-user-data";
import { SignalActions } from "@/lib/types/signal.types";
import { extractTopicsFromJsonLogic } from "@/lib/utils/signal.utils";
import {
  useSmartSignalById,
  useUpdateSmartSignal,
} from "@/services/queries/signals";
import { LoaderCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";

const SmartSignalsEdit = () => {
  const [signalId] = useQueryState("id");
  const { data, isLoading } = useSmartSignalById(signalId);
  const { mutateAsync: updateSignal, isPending } = useUpdateSmartSignal();
  const user = useUserData();

  const [signalName, setSignalName] = useState("");
  const [signalDescription, setSignalDescription] = useState("");
  const [condition, setCondition] = useState<object | null>(null);

  const [signalActions, setSignalActions] = useState<SignalActions>({
    email: true,
    notification: true,
  });

  useEffect(() => {
    if (data && data.condition) {
      setCondition(JSON.parse(data.condition));
      setSignalName(data.name ?? "");
      setSignalDescription(data.description ?? "");
      setSignalActions({
        email: !!data.actions.find((action) => action.type === "email"),
        notification: !!data.actions.find(
          (action) => action.type === "notification"
        ),
      });
      console.log("🚀 ~ SmartSignalsEdit ~ data:", data);
    }
  }, [data]);

  const handleSave = async () => {
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

    if (!condition || !user?.id) return;

    const payload = {
      id: signalId as string,
      name: signalName,
      description: signalDescription,
      condition: JSON.stringify(condition),
      actions,
      topics: extractTopicsFromJsonLogic(condition),
      user_id: user.id,
    };

    await updateSignal(payload);
    redirect("/signals");
  };

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen p-2 h-full">
        <div className="w-full h-80 flex items-center justify-center">
          <LoaderCircle className="animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen p-2 h-full ">
      <div className=" w-full max-w-7xl mx-auto">
        <div className="mt-14">
          <Button
            variant={"ghost"}
            size={"sm"}
            className="text-fomoed-red"
            onClick={() => redirect("/signals")}
          >
            ← Back
          </Button>
          <h1 className="text-2xl text-white my-6">Edit Smart Signal</h1>
        </div>

        <div className="space-y-6">
          {condition && (
            <ManualSignalBuilder
              editMode
              initialLogic={condition}
              logic={condition}
              setLogic={setCondition}
            />
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
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <LoaderCircle className="animate-spin" />}
              Save Signal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSignalsEdit;
