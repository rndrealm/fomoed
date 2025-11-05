import React, { Fragment } from "react";

const GoverningLaws = () => {
  return (
    <Fragment>
      <h2 className="mb-4 text-[15px] font-normal text-[#FFFFFF] font-inter">
        9. Governing Law and Dispute Resolution:
      </h2>

      <div className="mb-4">
        <p className="mb-2 text-[14px] font-normal text-[#D1D1D1] font-inter ml-6">a. Primary:</p>
        <ul className="list-disc space-y-2 pl-12">
          <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">Delaware General Corporation Law</li>
        </ul>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[14px] font-normal text-[#D1D1D1] font-inter ml-6">b. Secondary Compliance:</p>
        <ul className="list-disc space-y-2 pl-12">
          <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
            Georgia Computer Systems Protection Act (OCGA § 16-9-90)
          </li>
          <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
            Florida Electronic Security Act (Fla. Stat. § 668.50)
          </li>
          <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
            Disputes will be resolved informally via support@fomoed.io within 30 days. Unresolved disputes may be
            subject to binding arbitration under the American Arbitration Association&apos;s rules, on an individual basis
            only (no class actions).
          </li>
        </ul>
      </div>
    </Fragment>
  );
};

export default GoverningLaws;
