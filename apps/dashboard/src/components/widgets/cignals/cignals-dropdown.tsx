import React, { useMemo, useRef, useState } from "react";
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
import useOutsideClick from "@/hooks/useOutsideClick";

interface IProps {
  availableInstruments: ParsedCignalsInstrumentArray;
  onClose: () => void;
  onSave: (newOptions: CignalsChartOptions) => void;
  originalOptions: CignalsChartOptions;
}

const CignalsDropdown = (props: IProps) => {
  const { availableInstruments, onClose, onSave, originalOptions } = props;
  const [ref] = useOutsideClick(() => {});
  // const [ref] = useOutsideClick(onClose);

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
    <div
      className="absolute top-10 right-0 flex items-center justify-center w-[290px] h-fit pt-3 bg-black z-[10] border border-[#232323] rounded-[10px]"
      ref={ref}
    >
      <div className="w-full">
        <div className="border-b border-b-[#232323]">
          <h1 className="mb-3 font-medium  text-xs  text-[white] px-2 ">
            Footprint chart settings
          </h1>
        </div>
        <div className="flex flex-col gap-4 px-2 py-3">
          <div className="flex items-center justify-between ">
            <label
              htmlFor="instrument"
              className="text-[#878787] text-xs font-medium"
            >
              Pairs
            </label>
            <ComboboxComp
              options={instrumentOptions}
              value={cignalForm.instrument}
              setValue={(value) => handleChange("instrument", value)}
              emptySearch="Select Instruments"
              inputPlaceholder="Select Instruments"
              emptySelect="No frameworks found"
              triggerClassName="justify-between bg-transparent w-[160px] text-white text-[0.625rem] rounded-[3px] h-[26px] hover:bg-transparent hover:text-white border border-[#3E3E3E]"
            />
          </div>
          <div className="flex items-center justify-between ">
            <label
              htmlFor="timeframe"
              className="text-[#878787] text-xs font-medium"
            >
              Time Interval
            </label>
            <SelectComp
              options={periodOptions}
              value={cignalForm.timeframe}
              setValue={(value) => handleChange("timeframe", value)}
              triggerClassName="justify-between bg-transparent w-[160px] text-white text-[0.625rem] rounded-[3px] !h-[26px] hover:bg-transparent hover:text-white border border-[#3E3E3E]"
            />
          </div>
          <div className="flex items-center justify-between ">
            <label className="text-[#878787] text-xs font-medium">
              Price Interval
            </label>
            <Input
              value={cignalForm.priceStep || undefined}
              type="number"
              className="justify-between bg-transparent w-[160px] text-white !text-[0.625rem] rounded-[3px] !h-[26px] hover:bg-transparent hover:text-white border border-[#3E3E3E]"
              onChange={(e) =>
                handleChange("priceStep", e.target.valueAsNumber)
              }
            />
          </div>
          <div className="flex items-center justify-end gap-2 mt-2">
            <Button
              onClick={onClose}
              className="text-white bg-red-800 text-[0.625rem] font-medium h-7 hover:bg-red-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="text-black bg-white text-[0.625rem] font-medium h-7 hover:bg-white hover:text-black"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CignalsDropdown;
