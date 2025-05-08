import { useSmartSignals } from "@/screens/hooks/use-smart-signals";
import { LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { RenderIf } from "../shared";
import { Card, CardContent } from "../ui/card";
import MySmartSignalCard from "./my-smart-signal-card";

const EmptyState = () => {
  return (
    <Card className="w-full h-80">
      <CardContent className="flex items-center justify-center flex-col w-full h-full ">
        Create your very own Smart Signals
        <button className="bg-fomoed-red text-white px-2 py-1 rounded mt-2 flex items-center text-sm">
          <Plus size={12} />
          New Signal
        </button>
      </CardContent>
    </Card>
  );
};
const MySignals = () => {
  const { deleteSmartSignal, smartSignals, isLoading } = useSmartSignals();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  console.log("🚀 ~ MySignals ~ smartSignals:", smartSignals);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await deleteSmartSignal(id);
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-2 gap-5">
      <RenderIf condition={smartSignals.length === 0}>
        <EmptyState />
      </RenderIf>

      <RenderIf condition={smartSignals.length > 0}>
        {smartSignals.map((signal, idx) => (
          <MySmartSignalCard
            key={signal.id}
            title={`My Signal ${idx + 1}`}
            description={"Alert when price is above 100000 (example)"}
            conditions={JSON.parse(signal.condition)}
            hasInAppNotifications={true}
            hasEmailNotifications={true}
            lastUpdated={signal.updated_at}
          />
        ))}
      </RenderIf>
    </div>
  );
};

export default MySignals;
