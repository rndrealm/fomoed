import {
  smartSignalsAtom,
  useSmartSignals,
} from "@/screens/hooks/use-smart-signals";
import { useAtom } from "jotai";
import { useState } from "react";

type Props = {};

const MySignals = (props: Props) => {
  const [smartSignals] = useAtom(smartSignalsAtom);
  const { deleteSmartSignal } = useSmartSignals();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await deleteSmartSignal(id);
    setDeletingId(null);
  };

  if (smartSignals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#232323] rounded-md border border-[#333333] text-gray-400">
        <span className="text-base font-medium">No smart signals</span>
      </div>
    );
  }

  return <div className="w-full grid grid-cols-2"></div>;
};

export default MySignals;
