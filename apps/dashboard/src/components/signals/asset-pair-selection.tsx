import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

interface AssetPairSelectorProps {
  selectedAsset: string;
  onAssetSelect: (assetId: string) => void;
}

const AssetPairSelector: React.FC<AssetPairSelectorProps> = ({
  selectedAsset,
  onAssetSelect,
}) => {
  const assetPairs = [
    { id: "btc-usdt", name: "BTC/USDT", icon: "₿" },
    { id: "eth-usdt", name: "ETH/USDT", icon: "Ξ" },
    { id: "sol-usdt", name: "SOL/USDT", icon: "◎" },
    { id: "doge-usdt", name: "DOGE/USDT", icon: "Ð" },
    { id: "bnb-usdt", name: "BNB/USDT", icon: "BNB" },
  ];

  return (
    <div className="mb-4">
      <Label htmlFor="asset-pair" className="block text-sm font-medium mb-1">
        Asset Pair
      </Label>
      <Select value={selectedAsset} onValueChange={onAssetSelect}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder="Select asset pair" />
        </SelectTrigger>
        <SelectContent>
          {assetPairs.map((asset) => (
            <SelectItem key={asset.id} value={asset.id}>
              <div className="flex items-center">
                <span className="mr-2 font-mono">{asset.icon}</span>
                <span>{asset.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssetPairSelector;
