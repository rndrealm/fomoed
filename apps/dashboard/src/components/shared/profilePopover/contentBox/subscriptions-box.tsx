import React, { useMemo } from "react";
import { ProfileIcon } from "../../profile-icon";
import PlusIcon from "@/components/icons/PlusIcon";
import { BasicPlanIcon, Question, YellowStarSvg } from "@/components/icons/icons";
import useUserData from "@/lib/hooks/use-user-data";
import useSubscription from "@/hooks/subscription";
import { capitalize } from "lodash-es";
import { RenderIf } from "../../render-if";

const SubscriptionsBox = () => {
  const { userSubscriptionQueryData } = useSubscription();

  const planLabel = useMemo(() => {
    if (!userSubscriptionQueryData) {
      return "";
    }

    return capitalize(userSubscriptionQueryData.activePlan);
  }, [userSubscriptionQueryData]);

  const planSubtitle = useMemo(() => {
    if (!userSubscriptionQueryData || userSubscriptionQueryData.activePlan === "basic") {
      return "";
    }

    const usdAmount = (userSubscriptionQueryData.renewsForUsd || 0) / 100;

    if (userSubscriptionQueryData.trialEndsIn && userSubscriptionQueryData.renewsIn) {
      return `Trial (Pro) ends in ${userSubscriptionQueryData.trialEndsIn}, then $${usdAmount}`;
    }

    if (userSubscriptionQueryData.trialEndsIn && !userSubscriptionQueryData.renewsIn) {
      return `Trial (Pro) ends in ${userSubscriptionQueryData.trialEndsIn}, then cancels`;
    }

    if (userSubscriptionQueryData.renewsIn) {
      const renewsToString =
        userSubscriptionQueryData.activePlan === userSubscriptionQueryData.nextPeriodPlan
          ? ""
          : `; switches to ${capitalize(userSubscriptionQueryData.nextPeriodPlan)}`;

      return `Renews in ${userSubscriptionQueryData?.renewsIn}${renewsToString}`;
    }

    return `Expires in ${userSubscriptionQueryData?.cancelsIn}`;
  }, [userSubscriptionQueryData]);

  return (
    <div className="max-w-[520px]  mx-auto scrollbar flex-1 w-full flex flex-col gap-8 bg-[#131313] px-6 md:px-10 pb-6 pt-13 overflow-y-auto">
      <div className="h-full flex flex-col items-start gap-6 text-white text-[13px] font-normal">
        <div className="w-full flex flex-col gap-2">
          <p className="text-xs text-[#a4a4a4]">Subscriptions and Plans</p>
          <p className="text-white">
            The Fomoed Subscriptions and Plans come in three (3) tiers, these are your current subsctiptions
          </p>
        </div>
        {/*  */}
        <div className="py-6 w-full flex flex-row justify-between items-start border-y-[1px] border-[#242424]">
          <div className="flex flex-col gap-2 items-start justify-between">
            <div className="flex flex-row gap-2 items-center">
              <div className="h-[28px] aspect-square flex items-center justify-center">
                <RenderIf condition={!!userSubscriptionQueryData}>
                  {userSubscriptionQueryData?.activePlan !== "basic" ? <YellowStarSvg /> : <BasicPlanIcon />}
                </RenderIf>
              </div>
              <p className="text-[14px]">{planLabel}</p>
            </div>
            <p className="text-xs text-[#a4a4a4]">{planSubtitle}</p>
          </div>
          <div className="flex flex-col items-start justify-start">
            <button
              type="button"
              disabled
              className="px-4 py-2 bg-[#FF8970] text-[#33120B] rounded-[8px] cursor-not-allowed"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
        {/*  */}
        <div className="w-full flex flex-col gap-8">
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-row items-center gap-1.5">
              <p className="font-normal text-xs text-[#a4a4a4]">Subscription Credit</p>
              <div className="px-2 py-1 bg-white rounded-[4px]">
                <p className="uppercase font-medium text-[#6E8ECB] text-[10px]">Comming Soon</p>
              </div>
            </div>
            <p>Earn Fomoed tokens and credit when you use the application, you can subscribe to plan with them.</p>
          </div>

          <div className="w-full">
            <div className="flex flex-row gap-6 items-center">
              <div>
                <TextSvg />
              </div>
              <div className="flex flex-col gap-1">
                <p className="">Fomoed Tokens</p>
                <span className="underline text-[#167AFD] text-xs cursor-not-allowed">How to earn more tokens</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsBox;

const TextSvg = () => {
  return (
    <svg width="68" height="95" viewBox="0 0 68 95" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="path-1-outside-1_1064_11819" maskUnits="userSpaceOnUse" x="0" y="0" width="68" height="95" fill="black">
        <rect fill="white" width="68" height="95" />
        <path d="M31.7035 93.024C10.0715 93.024 1.3675 78.176 1.3675 50.784V43.616C1.3675 16.224 10.0715 1.376 31.7035 1.376H36.1835C57.9435 1.376 66.6475 16.224 66.6475 43.616V50.784C66.6475 78.176 57.9435 93.024 36.1835 93.024H31.7035ZM36.0555 83.168C49.8795 83.168 55.7675 72.8 55.7675 52.064V42.336C55.7675 21.6 49.8795 11.232 36.0555 11.232H32.0875C18.1355 11.232 12.3755 21.6 12.3755 42.336V52.064C12.3755 72.8 18.1355 83.168 32.0875 83.168H36.0555Z" />
      </mask>
      <path
        d="M31.7035 93.024C10.0715 93.024 1.3675 78.176 1.3675 50.784V43.616C1.3675 16.224 10.0715 1.376 31.7035 1.376H36.1835C57.9435 1.376 66.6475 16.224 66.6475 43.616V50.784C66.6475 78.176 57.9435 93.024 36.1835 93.024H31.7035ZM36.0555 83.168C49.8795 83.168 55.7675 72.8 55.7675 52.064V42.336C55.7675 21.6 49.8795 11.232 36.0555 11.232H32.0875C18.1355 11.232 12.3755 21.6 12.3755 42.336V52.064C12.3755 72.8 18.1355 83.168 32.0875 83.168H36.0555Z"
        fill="url(#paint0_linear_1064_11819)"
      />
      <path
        d="M31.7035 93.024V92.024C21.1475 92.024 13.9061 88.4217 9.24894 81.6115C4.53937 74.7247 2.3675 64.4103 2.3675 50.784H1.3675H0.3675C0.3675 64.5497 2.54763 75.3553 7.59806 82.7405C12.7009 90.2023 20.6276 94.024 31.7035 94.024V93.024ZM1.3675 50.784H2.3675V43.616H1.3675H0.3675V50.784H1.3675ZM1.3675 43.616H2.3675C2.3675 29.9897 4.53937 19.6753 9.24894 12.7885C13.9061 5.97828 21.1475 2.376 31.7035 2.376V1.376V0.375999C20.6276 0.375999 12.7009 4.19772 7.59806 11.6595C2.54763 19.0447 0.3675 29.8503 0.3675 43.616H1.3675ZM31.7035 1.376V2.376H36.1835V1.376V0.375999H31.7035V1.376ZM36.1835 1.376V2.376C46.8058 2.376 54.0787 5.97989 58.7509 12.7897C63.4756 19.676 65.6475 29.9895 65.6475 43.616H66.6475H67.6475C67.6475 29.8505 65.4675 19.044 60.4001 11.6583C55.2803 4.19611 47.3213 0.375999 36.1835 0.375999V1.376ZM66.6475 43.616H65.6475V50.784H66.6475H67.6475V43.616H66.6475ZM66.6475 50.784H65.6475C65.6475 64.4105 63.4756 74.724 58.7509 81.6103C54.0787 88.4201 46.8058 92.024 36.1835 92.024V93.024V94.024C47.3213 94.024 55.2803 90.2039 60.4001 82.7417C65.4675 75.356 67.6475 64.5495 67.6475 50.784H66.6475ZM36.1835 93.024V92.024H31.7035V93.024V94.024H36.1835V93.024ZM36.0555 83.168V84.168C43.2673 84.168 48.5409 81.4342 51.9464 75.9173C55.2946 70.4932 56.7675 62.4885 56.7675 52.064H55.7675H54.7675C54.7675 62.3755 53.2964 69.9228 50.2446 74.8667C47.2501 79.7178 42.6677 82.168 36.0555 82.168V83.168ZM55.7675 52.064H56.7675V42.336H55.7675H54.7675V52.064H55.7675ZM55.7675 42.336H56.7675C56.7675 31.9115 55.2946 23.9068 51.9464 18.4827C48.5409 12.9658 43.2673 10.232 36.0555 10.232V11.232V12.232C42.6677 12.232 47.2501 14.6822 50.2446 19.5333C53.2964 24.4772 54.7675 32.0245 54.7675 42.336H55.7675ZM36.0555 11.232V10.232H32.0875V11.232V12.232H36.0555V11.232ZM32.0875 11.232V10.232C24.8143 10.232 19.5382 12.9639 16.1474 18.4846C12.8155 23.9095 11.3755 31.9147 11.3755 42.336H12.3755H13.3755C13.3755 32.0213 14.8155 24.4745 17.8516 19.5314C20.8288 14.6841 25.4087 12.232 32.0875 12.232V11.232ZM12.3755 42.336H11.3755V52.064H12.3755H13.3755V42.336H12.3755ZM12.3755 52.064H11.3755C11.3755 62.4853 12.8155 70.4905 16.1474 75.9154C19.5382 81.4361 24.8143 84.168 32.0875 84.168V83.168V82.168C25.4087 82.168 20.8288 79.7159 17.8516 74.8686C14.8155 69.9255 13.3755 62.3787 13.3755 52.064H12.3755ZM32.0875 83.168V84.168H36.0555V83.168V82.168H32.0875V83.168Z"
        fill="url(#paint1_linear_1064_11819)"
        mask="url(#path-1-outside-1_1064_11819)"
      />
      <defs>
        <linearGradient id="paint0_linear_1064_11819" x1="34" y1="-21" x2="34" y2="107" gradientUnits="userSpaceOnUse">
          <stop offset="0.0462428" stop-color="white" />
          <stop offset="0.751445" stop-color="#272727" />
        </linearGradient>
        <linearGradient id="paint1_linear_1064_11819" x1="34" y1="-21" x2="39" y2="145" gradientUnits="userSpaceOnUse">
          <stop offset="0.318045" stop-color="#91592C" />
          <stop offset="1" stop-color="#F7984B" />
        </linearGradient>
      </defs>
    </svg>
  );
};
