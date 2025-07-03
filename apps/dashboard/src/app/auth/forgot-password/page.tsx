"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { FormBottomLink, SubmitButton, TextInput } from "@/components/auth";
import ArrowRight from "@/components/icons/ArrowRight";
import FormLogo from "@/components/icons/FormLogo";
import FormBottomDivider from "@/components/icons/FormBottomDivider";
import { AppRoutes } from "@/lib/routes";
import { forgotPassword } from "@/services/queries/auth/server-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Please enter a valid email address").required("Please enter your email address"),
});

const initialValues = {
  email: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (_values: InitialValues) => {
    try {
      setIsLoading(true);
      const retUser = await forgotPassword(_values);
      if (retUser.success) {
        router.push(AppRoutes.auth.forgotPassword.passwordMessage.path);
      } else {
        toast(retUser.message || "Something went wrong!");
      }
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#000] px-4 pb-8">
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="flex w-full max-w-[418px] flex-col gap-5">
          <div className="flex justify-center">
            <FormLogo />
          </div>
          <div className="flex w-full flex-col gap-12 rounded-2xl border border-[#1e1e1e] bg-[#080808] px-6 py-[48px]">
            <div className="mx-auto flex max-w-[313px] flex-col gap-2">
              <h3 className="text-center text-xl leading-[1.35] font-medium text-white">Reset Password</h3>
              <p className="text-center text-base leading-[1.35] font-medium text-[#5f5f5f]">
                we’ll send you a link to reset your password
              </p>
            </div>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
              {(props) => {
                const { values, handleChange, handleBlur, handleSubmit } = props;

                return (
                  <form onSubmit={handleSubmit} className="">
                    <div className="flex flex-col gap-4">
                      <TextInput
                        name="email"
                        id="email"
                        placeholder="you@email.com"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />

                      <div className="">
                        <SubmitButton isLoading={isLoading} disabled={isLoading}>
                          Continue
                          <ArrowRight />
                        </SubmitButton>
                      </div>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-5">
        <div className="flex w-full">
          <FormBottomDivider />
        </div>
        <FormBottomLink href={AppRoutes.auth.login.path} infoText="Return To" linkText="Sign In" />
      </div>
    </div>
  );
}
