import { activeSignalTabAtom } from "@/lib/atoms/signalTabsAtom";
import { useSmartSignals } from "@/services/queries/signals";
import { useAtom } from "jotai";
import { LoaderCircle, Plus } from "lucide-react";
import { RenderIf } from "../shared";
import { Card, CardContent } from "../ui/card";
import MySmartSignalCard from "./my-smart-signal-card";

const EmptyState = () => {
  const [_, setActiveSignalTab] = useAtom(activeSignalTabAtom);
  return (
    <Card className="w-full h-80">
      <CardContent className="flex items-center justify-center flex-col w-full h-full ">
        Create your very own Smart Signals
        <button
          onClick={() => setActiveSignalTab("signal-builder")}
          className="bg-fomoed-red text-white px-2 py-1 rounded mt-2 flex items-center text-sm"
        >
          <Plus size={12} />
          New Signal
        </button>
      </CardContent>
    </Card>
  );
};

const MySignals = () => {
  const { data: smartSignals = [], isLoading, isFetched } = useSmartSignals();
  const [_, setActiveSignalTab] = useAtom(activeSignalTabAtom);

  if (isLoading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between my-6">
        <h1 className="font-medium text-xl">My Smart Signals</h1>

        <button
          onClick={() => setActiveSignalTab("signal-builder")}
          className="bg-fomoed-red text-white px-2 py-1 rounded flex items-center text-sm"
        >
          <Plus size={12} />
          New Signal
        </button>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        <RenderIf condition={isFetched && smartSignals.length === 0}>
          <EmptyState />
        </RenderIf>

        <RenderIf condition={smartSignals?.length > 0}>
          {smartSignals &&
            smartSignals.map((signal, idx) => (
              <MySmartSignalCard
                key={signal.id}
                id={signal.id as number}
                title={signal.name}
                description={signal.description}
                conditions={JSON.parse(signal.condition)}
                hasInAppNotifications={true}
                hasEmailNotifications={true}
                lastUpdated={signal.updated_at}
              />
            ))}
        </RenderIf>
      </div>
    </div>
  );
};

export default MySignals;
