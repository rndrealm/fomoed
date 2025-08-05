import { useEffect } from "react";
import SignalConditionGroup, { Group } from "./condition-group";

type ManualSignalBuilderProps = {
  rootGroup: Group;
  onRootGroupChange: (group: Group) => void;
};

const ManualSignalBuilder = ({
  rootGroup,
  onRootGroupChange,
}: ManualSignalBuilderProps) => {
  useEffect(() => console.debug("Root group:", rootGroup), [rootGroup]);

  return (
    <SignalConditionGroup
      group={rootGroup}
      depth={0}
      onUpdate={onRootGroupChange}
    />
  );
};

export default ManualSignalBuilder;
