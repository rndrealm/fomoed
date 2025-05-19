import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ComboboxComp } from "@/components/shared/combobox";
import {
  availableCignalTimesteps,
  CignalsChartOptions,
  CignalsTimestep,
  ParsedCignalsInstrumentArray,
} from "@/charts/cignals-chart/types";
import { Button } from "@/components/ui/button";
import { SelectComp } from "@/components/shared/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface IProps {
  availableInstruments: ParsedCignalsInstrumentArray;
  onClose: () => void;
  onSave: (newOptions: CignalsChartOptions) => void;
  originalOptions: CignalsChartOptions;
}

const CignalsModal = (props: IProps) => {
  const { availableInstruments, onClose, onSave, originalOptions } = props;

  const [cignalForm, setCignalForm] = useState({
    instrument: originalOptions.instrument?.label?.toLowerCase() || "",
    timeframe: originalOptions.timeInterval,
    priceStep: originalOptions.priceStep,
  });
  const handleChange = (name: string, value: string | number) => {
    setCignalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const instrumentOptions = useMemo(() => {
    return availableInstruments
      .filter(
        (i) =>
          i.perpetual &&
          i.exchange === "binance_futures" &&
          !i.label.includes("testnet")
      )
      .toSorted((a, b) => (a.id > b.id ? 1 : -1))
      .map((instrument) => {
        const shortLabel = instrument.label
          .replace("Binance futures", "")
          .replace("PERP", "");

        return {
          label: shortLabel,
          value: instrument.label.toLowerCase(),
        };
      });
  }, [availableInstruments]);

  const periodOptions = useMemo(() => {
    return availableCignalTimesteps.map((timestep) => ({
      label: timestep,
      value: timestep,
    }));
  }, []);

  const handleSave = () => {
    const selectedInstrument = availableInstruments.find(
      (i) => i.label.toLowerCase() === cignalForm.instrument
    );

    if (!selectedInstrument) {
      toast("Please select a valid instrument");
      return;
    }

    const newOptions: CignalsChartOptions = {
      instrument: selectedInstrument,
      timeInterval: cignalForm.timeframe as CignalsTimestep,
      priceStep: cignalForm.priceStep,
    };
    onSave(newOptions);
  };

  return (
    <div className="absolute flex items-center justify-center w-full h-full bg-black">
      <div>
        <h1 className="mb-3 font-semibold text-center text-white">
          Footprint chart settings
        </h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col ">
            <ComboboxComp
              options={instrumentOptions}
              value={cignalForm.instrument}
              setValue={(value) => handleChange("instrument", value)}
              emptySearch="Select Instruments"
              inputPlaceholder="Select Instruments"
              emptySelect="No frameworks found"
              label="Instrument"
            />
          </div>
          <div className="w-full">
            <SelectComp
              options={periodOptions}
              value={cignalForm.timeframe}
              label="Timeframe"
              setValue={(value) => handleChange("timeframe", value)}
            />
          </div>
          <div>
            <label className="pb-1 text-white">Price Step</label>
            <Input
              value={cignalForm.priceStep || undefined}
              type="number"
              className="bg-white"
              onChange={(e) =>
                handleChange("priceStep", e.target.valueAsNumber)
              }
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CignalsModal;
