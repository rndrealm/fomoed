"use client";

import { ModalContainer } from "@/components/shared/modal-container";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { UpgradeTo } from "../upgrade-to";
import useSubscription from "@/hooks/subscription";
import { PlanType } from "@/lib/plans";

interface AutoShowUpgradePopupProps {
  upgradeToPlan: PlanType;
  onPlanLoaded?: () => void;
}

export const AutoShowUpgradePopup = ({
  upgradeToPlan,
  onPlanLoaded,
}: AutoShowUpgradePopupProps) => {
  const {activePlan} = useSubscription();

  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(true);
  const planLoadedCalledRef = useRef(false);

  const userIsOnRequiredPlan = activePlan === upgradeToPlan;
  const planLoaded = activePlan !== undefined;

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
