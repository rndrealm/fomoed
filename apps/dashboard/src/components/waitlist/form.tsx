"use client";
import React, { Fragment, useState } from "react";
import Step1 from "./step1";
import { RenderIf } from "../shared";
import Step2 from "./step2";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Step3 from "./step3";
import Step4 from "./step4";
import Step5 from "./step5";
import Step6 from "./step6";
import Step7 from "./step7";
import { useAtom } from "jotai";
import { formStepAtom } from "@/lib/atoms/waitlist";
import { useJoinWaitlist, useUploadImage } from "@/services/queries/waitlist";
import { useSupabaseAuth } from "../providers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/lib/routes";

const initialValues = {
  name: "",
  email: "",
  platform: "",
  biggest_win: "",
  percentage_return: "",
  asset_name: "",
  pnlProof: null as File | null,
};

type FormValues = typeof initialValues;

export function WaitlistForm() {
  const [step, setStep] = useAtom(formStepAtom);
  const [formValues, setFormValues] = useState(initialValues);

  const { session } = useSupabaseAuth();

  const imageUpload = useUploadImage(session?.access_token);

  const joinWaitlist = useJoinWaitlist(session?.access_token);

  const router = useRouter();

  const handleUploadProof = (file: File) => {
    imageUpload.mutate(file, {
      onSuccess(data) {
        const imageUrl = data?.data?.url;
        handleJoinWaitlist(imageUrl);
      },
      onError() {
        toast.error("Something went wrong. Please try again.");
      },
    });
  };

  const handleJoinWaitlist = (imageUrl: string) => {
    const { pnlProof, ...res } = formValues;
    const body = {
      ...res,
      proof_url: imageUrl,
    };

    joinWaitlist.mutate(body, {
      onSuccess(data) {
        toast.success("Successfully joined the waitlist!");
        const entry = data?.data?.total_entries;

        router.push(`${AppRoutes.waitlist.success.path}?entry=${entry}`);
      },
      onError() {
        toast.error("Something went wrong. Please try again.");
      },
    });
  };

  return (
    <div className="flex gap-12 w-full justify-center">
      <div className={cn("mt-13 hidden sm:block", step === 1 ? "invisible" : "")}>
        <button
          type="button"
          onClick={() => {
            setStep((prev) => prev - 1);
          }}
        >
          <div className="w-[24px] h-[24px]">
            <ArrowLeft color="#fff" />
          </div>
        </button>
      </div>
      <div className="max-w-[372px] w-full">
        <RenderIf condition={step === 1}>
          <Step1
            handleSubmit={(data) => {
              setStep(2);
              setFormValues((prev) => ({ ...prev, ...data }));
            }}
            initialValues={formValues}
          />
        </RenderIf>

        <RenderIf condition={step === 2}>
          <Step2
            handleSubmit={(data) => {
              setStep(3);
              setFormValues((prev) => ({ ...prev, ...data }));
            }}
            initialValues={formValues}
          />
        </RenderIf>

        <RenderIf condition={step === 3}>
          <Step3
            handleSubmit={(data) => {
              setStep(4);
              setFormValues((prev) => ({ ...prev, ...data }));
            }}
            initialValues={formValues}
          />
        </RenderIf>

        <RenderIf condition={step === 4}>
          <Step4
            handleSubmit={(data) => {
              setStep(5);
              setFormValues((prev) => ({ ...prev, ...data }));
            }}
            initialValues={formValues}
          />
        </RenderIf>

        <RenderIf condition={step === 5}>
          <Step5
            handleSubmit={(data) => {
              setStep(6);
              setFormValues((prev) => ({ ...prev, ...data }));
            }}
            initialValues={formValues}
          />
        </RenderIf>

        <RenderIf condition={step === 6}>
          <Step6
            handleSubmit={(data) => {
              setStep(7);
              setFormValues((prev) => ({ ...prev, ...data }));
            }}
            initialValues={formValues}
          />
        </RenderIf>

        <RenderIf condition={step === 7}>
          <Step7
            handleSubmit={(data) => {
              const finalData = { ...formValues, ...data };
              setFormValues(finalData);
              if (finalData.pnlProof) {
                handleUploadProof(finalData.pnlProof);
              }
            }}
            isLoading={imageUpload.isPending || joinWaitlist.isPending}
            initialValues={formValues}
          />
        </RenderIf>
      </div>

      <div className="mt-13 invisible hidden sm:block">
        <button type="button">
          <div className="w-[24px] bg-[#fff] h-[24px]"></div>
        </button>
      </div>
    </div>
  );
}
