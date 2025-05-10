"use client";
import ManualSignalBuilder from "@/components/signals/manual-signal-builder";
import NotificationSettings from "@/components/signals/notification-settings";
import SignalDetails from "@/components/signals/signal-details";
import { Button } from "@/components/ui/button";
import useUserData from "@/lib/hooks/use-user-data";
import { SignalActions } from "@/lib/types/signal.types";
import { useSmartSignalById } from "@/services/queries/signals";
import { LoaderCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";

const SmartSignalsEdit = () => {
  const [signalId] = useQueryState("id");
  const { data, isLoading } = useSmartSignalById(signalId);
  console.log("🚀 ~ SmartSignalsEdit ~ data:", data);

  const [signalName, setSignalName] = useState("");
  const [signalDescription, setSignalDescription] = useState("");
  const [condition, setCondition] = useState<object | null>(null);
  console.log("🚀 ~ SmartSignalsEdit ~ condition:", condition);
  const [signalActions, setSignalActions] = useState<SignalActions>({
    email: true,
    notification: true,
  });

  const user = useUserData();

  useEffect(() => {
    if (data && data.condition) {
      setCondition(JSON.parse(data.condition));
    }
  }, [data]);

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
            <Button onClick={() => {}}>Save Signal</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSignalsEdit;
