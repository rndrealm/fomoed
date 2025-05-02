import { ConditionGroup } from "@/lib/types/signal.types";
import React from "react";
import { Separator } from "../ui/separator";
import AssetPairSelector from "./asset-pair-selection";
import ConditionGroupComponent from "./condition-group";

interface ManualSignalBuilderProps {
  rootCondition: ConditionGroup;
  onUpdateRootCondition: (updatedRoot: ConditionGroup) => void;
  primaryAssetPair: string;
  onUpdatePrimaryAssetPair: (assetPair: string) => void;
}

const ManualSignalBuilder: React.FC<ManualSignalBuilderProps> = ({
  rootCondition,
  onUpdateRootCondition,
  primaryAssetPair,
  onUpdatePrimaryAssetPair,
}) => {
  return (
    <div className="">
      <h2 className="text-xl font-medium ">Signal Conditions</h2>
      <p className="text-muted-foreground mb-2">Build your smart signals</p>

      <Separator className="mt-4 mb-9" />

      <div className="mb-6 max-w-56">
        <AssetPairSelector
          selectedAsset={primaryAssetPair}
          onAssetSelect={onUpdatePrimaryAssetPair}
        />
      </div>

      <ConditionGroupComponent
        group={rootCondition}
        onUpdate={onUpdateRootCondition}
        isRoot
        assetPair={primaryAssetPair}
      />
    </div>
  );
};

export default ManualSignalBuilder;
