"use client";
import ManualSignalBuilder from "@/components/signals/manual-signal-builder";
import { useSmartSignalById } from "@/services/queries/signals";
import { LoaderCircle } from "lucide-react";
import { useQueryState } from "nuqs";

const SmartSignalsEdit = () => {
  const [signalId] = useQueryState("id");
  const { data, isLoading } = useSmartSignalById(signalId);
  const condition = data?.condition ? JSON.parse(data.condition) : null;

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
    <div className="bg-black min-h-screen p-2 h-full  w-full max-w-7xl mx-auto">
      {condition && <ManualSignalBuilder editMode initialLogic={condition} />}
    </div>
  );
};

export default SmartSignalsEdit;
