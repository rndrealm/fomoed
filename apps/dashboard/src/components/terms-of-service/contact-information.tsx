import React, { Fragment } from "react";

const ContactInformation = () => {
  return (
    <Fragment>
      <h2 className="mb-4 text-[15px] font-normal text-[#FFFFFF] font-inter">9. Contact Information</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
          For questions or concerns, contact us at{" "}
          <a href="mailto:support@fomoed.com" className="text-[#9391F7] underline hover:text-gray-300 font-semibold">
            support@fomoed.com
          </a>
        </li>
      </ul>
    </Fragment>
  );
};

export default ContactInformation;
