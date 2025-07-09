"use client";
import React, { Suspense, useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { FormBottomLink, SubmitButton, TextInput } from "@/components/auth";
import ArrowRight from "@/components/icons/ArrowRight";
import FormLogo from "@/components/icons/FormLogo";
import FormBottomDivider from "@/components/icons/FormBottomDivider";
import { AppRoutes } from "@/lib/routes";
import { setNewPassword, signInWithTokenHash } from "@/services/queries/auth/server-actions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required("Please enter your password")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const initialValues = {
  password: "",
  confirmPassword: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

export default function Page() {
  return (
    <Suspense>
      <UpdatePassword />
    </Suspense>
  );
}

const UpdatePassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const token_hash = searchParams.get("token_hash");

  useEffect(() => {
    if (token_hash) {
      signInWithTokenHash(token_hash);
    }
  }, [token_hash]);

  const onSubmit = async (_values: InitialValues) => {
    try {
      setIsLoading(true);
      const retUser = await setNewPassword({ password: _values.password });
      if (retUser.success) {
        router.push(AppRoutes.dashboard.path);
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
          <div className="relative flex justify-center">
            <FormLogo />
          </div>

          <div className="relative rounded-2xl">
            <div className="auth_border"></div>
            <div className="relative flex w-full flex-col gap-12 rounded-2xl bg-[#080808] px-6 py-[48px]">
              <div className="mx-auto flex max-w-[313px] flex-col gap-2">
                <h3 className="text-center text-xl leading-[1.35] font-medium text-white">Create Password</h3>
                <p className="text-center text-base leading-[1.35] font-medium text-[#5f5f5f]">Create a new password</p>
              </div>
              <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                {(props) => {
                  const { values, handleChange, handleBlur, handleSubmit } = props;
                  const isError = !values.confirmPassword || !values.password;

                  return (
                    <form onSubmit={handleSubmit} className="">
                      <div className="flex flex-col gap-4">
                        <TextInput
                          name="password"
                          id="password"
                          placeholder="New Password"
                          type="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />

                        <TextInput
                          name="confirmPassword"
                          id="confirmPassword"
                          placeholder="Confirm Password"
                          type="password"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <div className="">
                          <SubmitButton isLoading={isLoading} disabled={isError}>
                            Continue
                            <ArrowRight fill={isError ? "#7d7d7d" : undefined} />
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
      </div>
      <div className="relative mx-auto flex w-full max-w-[440px] flex-col items-center gap-5">
        <div className="flex w-full">
          <FormBottomDivider />
        </div>
        <FormBottomLink href={AppRoutes.auth.login.path} infoText="Return To" linkText="Sign In" />
      </div>
    </div>
  );
};
