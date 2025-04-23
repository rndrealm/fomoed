import React from "react";
import PricingSwitch from "./pricing-switch";

const PricingCards = () => {
  return (
    <section className="mt-[6.25rem] ">
      {/* Basic card */}
      <div>
        <PricingSwitch
          label="Yearly"
          name="period"
          labelClassName="text-[#A5A5A5] text-xs"
        />
      </div>
    </section>
  );
};

export default PricingCards;
