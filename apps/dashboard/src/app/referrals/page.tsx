import ReferralLayout from "./layout"; // Import the dedicated layout
import ReferralPageContent from "@/components/referrals/ReferralPageContent"; // Renamed the content component
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <ReferralPageContent />
    </Suspense>
  );
}