import React, { Fragment } from "react";

const ProperUse = () => {
  return (
    <Fragment>
      <h2 className="mb-4 text-[15px] font-normal text-[#FFFFFF] font-inter">7. Proper Use</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
          Fomoed is intended for research and education purposes only. You may use the platform to explore data or
          learn, but not for direct financial decision-making without independent verification. You agree not to use
          Fomoed for illegal activities, manipulation (e.g., bot usage), or any purpose beyond its intended scope.
          Fomoed reserves the right to monitor usage and restrict access if misuse is detected.
        </li>
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
          Do not attempt to manipulate data, metrics, or campaigns.
        </li>
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">Respect intellectual property rights.</li>
      </ul>
    </Fragment>
  );
};

export default ProperUse;
