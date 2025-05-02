import { ConditionGroup } from "@/lib/types/signal.types";
import React from "react";
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
    <div className="space-y-4">
      <h2 className="text-lg font-medium mb-4">Signal Conditions</h2>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">
          Select primary asset pair for this signal:
        </p>
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
