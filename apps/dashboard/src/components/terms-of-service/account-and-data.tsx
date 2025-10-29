import React, { Fragment } from "react";

const AccountAndData = () => {
  return (
    <Fragment>
      <h2 className="mb-4 text-[15px] font-normal text-[#FFFFFF] font-inter">2. Account and Data</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
          Registration may require providing data (e.g., wallet addresses, social media links).
        </li>
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
          Fomoed may track usage, views, and interactions for analytics, marketing, or third-party sharing as its
          discretion.
        </li>
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
          You grant Fomoed a perpetual, irrevocable license to use this data.
        </li>
      </ul>
    </Fragment>
  );
};

export default AccountAndData;
