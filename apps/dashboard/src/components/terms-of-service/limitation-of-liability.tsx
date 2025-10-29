import React, { Fragment } from "react";

const LimitationOfLiability = () => {
  return (
    <Fragment>
      <h2 className="mb-4 text-[15px] font-normal text-[#FFFFFF] font-inter">4. Limitation of Liability</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
          Fomoed, its affiliates, officers, directors, employees, and agents (collectively, &quot;Fomoed&quot;) shall
          not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including
          but not limited to loss of profits, data, or goodwill, arising from your use of Fomoed services. This applies
          regardless of the cause, including negligence, breach of contract, or other legal theories, to the fullest
          extent permitted by law. Fomoed’s liability shall not exceed the amount you paid for services, if any, in the
          past 12 months.
        </li>
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
          Fomoed retains sole discretion to approve, adjust, or cancel any payouts or benefits (e.g., KOL earnings) and
          is not liable for inaccuracies in third-party analytics, bot manipulation, payment delays, failedtransactions,
          errors in wallet addresses, data accuracy, trade execution, funding transfers, or losses from third-party
          actions or connectivity issues. Payouts may be withheld or reversed if fraud or misuse is detected.
        </li >
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">Fomoed accepts no liability for financial decisions or actions taken based on our content.</li>
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
          Fomoed may collect, track, and use user data, interactions, and platform activities (e.g., views, workflows)
          for any purpose at its discretion and is not liable for data inaccuracies or privacy breaches beyond its
          control. Users assume all risks associated with using Fomoed services.
        </li>
        <li className="text-[14px] font-normal text-[#D1D1D1] font-inter">
          Some jurisdictions may not allow certain disclaimers; where prohibited, this Limitation applies to the maximum
          extent permitted, but Fomoed’s liability remains capped.
        </li>
      </ul>
    </Fragment>
  );
};

export default LimitationOfLiability;
