import { Condition } from "@/components/signals/condition-group";
import { atom } from "jotai";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { getDataSourceById } from "../utils/signal.utils";

type SignalModalConfig = {
  isOpen: boolean;
  data: {
    dataSource: string;
    topic: string;
    value: number;
  }[];
};

type SignalModalData = {
  conditions: Condition[];
};

// Base atom for signal modal state
export const signalModalConfigAtom = atom<SignalModalConfig>({
  isOpen: false,
  data: [],
});

// Derived atom that updates data based on the id of the data source
export const signalModalDataAtom = atom<SignalModalData>((get) => {
  const state = get(signalModalConfigAtom);

  const conditions: Condition[] = [];

  for (const data of state.data) {
    const dataSource = getDataSourceById(data.dataSource);

    if (!dataSource) {
      console.error(`Data source with id ${data.dataSource} not found`);
      continue;
    }

    if (dataSource.disabled) {
      toast.error(`Data source ${dataSource.name} is not available`);
    }

    conditions.push({
      id: nanoid(),
      type: "condition",
      dataSourceId: dataSource.id,
      topic: `${data.topic}`,
      operator: "==",
      value: data.value,
    });
  }

  console.log("🚀 ~ signalModalDataAtom ~ conditions:", conditions);

  return {
    conditions,
  };
});
