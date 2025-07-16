import { jsonLogicToGroup, toJsonLogic } from "@/lib/utils/signal.utils";
import { useCallback, useEffect, useState } from "react";
import SignalConditionGroup, { defaultGroup, Group } from "./condition-group";

type ManualSignalBuilderProps = {
  initialLogic?: object | null;
  setLogic: (logic: object | null) => void;
};

const ManualSignalBuilder = ({
  initialLogic,
  setLogic,
}: ManualSignalBuilderProps) => {
  // The root group state (always present)
  const [rootGroup, setRootGroup] = useState<Group>(
    initialLogic ? jsonLogicToGroup(initialLogic) : defaultGroup(0),
  );

  // Recursively update a group or condition in the tree
  const updateGroup = useCallback((updated: Group) => {
    setRootGroup(updated);
  }, []);

  useEffect(() => {
    const logic = toJsonLogic(rootGroup);
    console.log("🚀 ~ useEffect ~ logic:", logic, rootGroup);

    setLogic(logic);
  }, [rootGroup, setLogic]);

  return (
    <SignalConditionGroup group={rootGroup} depth={0} onUpdate={updateGroup} />
  );
};

export default ManualSignalBuilder;
