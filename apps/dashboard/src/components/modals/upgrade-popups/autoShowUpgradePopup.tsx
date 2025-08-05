"use client";

import { ModalContainer } from "@/components/shared/modal-container";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { UpgradeTo } from "../upgrade-to";

interface AutoShowUpgradePopupProps {
  upgradeToPlan: "PRO" | "PLUS";
  onPlanLoaded?: () => void;
}

export const AutoShowUpgradePopup = ({
  upgradeToPlan,
  onPlanLoaded,
}: AutoShowUpgradePopupProps) => {
  const { data: userPlansData } = useGetUserPlans();
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(true);
  const planLoadedCalledRef = useRef(false);

  const userIsOnRequiredPlan = userPlansData?.planType === upgradeToPlan;
  const planLoaded = userPlansData?.planType !== undefined;

  useEffect(() => {
    if (planLoaded && !planLoadedCalledRef.current && onPlanLoaded) {
      onPlanLoaded();
      planLoadedCalledRef.current = true;
    }
  }, [planLoaded, onPlanLoaded]);

  const handleClose = () => {
    setShowUpgradeModal(false);
    router.push("/dashboard");
  };

  return (
    !userIsOnRequiredPlan &&
    planLoaded &&
    showUpgradeModal && (
      <ModalContainer
        open={true}
        handleClose={handleClose}
        noHeader
        className="!md:max-w-[410px] bg-[transparent] !p-0"
      >
        <UpgradeTo upgradeToPlan={upgradeToPlan} handleClose={handleClose} />
      </ModalContainer>
    )
  );
};
