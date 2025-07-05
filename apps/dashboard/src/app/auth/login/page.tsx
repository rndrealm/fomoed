"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { FormBottomLink, SubmitButton, TextInput } from "@/components/auth";
import ArrowRight from "@/components/icons/ArrowRight";
import FormLogo from "@/components/icons/FormLogo";
import { GoogleLogin } from "@/components/auth/google-login";
import FormBottomDivider from "@/components/icons/FormBottomDivider";
import Link from "next/link";
import { AppRoutes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/queries/auth/server-actions";
import { toast } from "sonner";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Please enter a valid email address").required("Please enter your email address"),

  password: Yup.string().required("Please enter your password"),
});

const initialValues = {
  email: "",
  password: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (_values: InitialValues) => {
    try {
      setIsLoading(true);
      const retUser = await loginUser(_values);
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
            <div className="relative flex w-full flex-col gap-12 rounded-2xl bg-[#070707] px-6 py-[48px]">
              <div className="mx-auto flex max-w-[313px] flex-col gap-2">
                <h3 className="text-center text-xl leading-[1.35] font-medium text-white">Welcome Back</h3>
                <p className="text-center text-base leading-[1.35] font-medium text-[#5f5f5f]">
                  Login to access more tools.
                </p>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                validateOnBlur
                validateOnMount
                validateOnChange
              >
                {(props) => {
                  const { values, handleChange, handleBlur, handleSubmit } = props;
                  const isError = !values.email || !values.password;

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

                        <TextInput
                          name="password"
                          id="password"
                          placeholder="password"
                          type="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <div className="">
                          <SubmitButton isLoading={isLoading} disabled={isError}>
                            Login
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

          <div className="relative flex flex-col gap-6">
            <div className="mt-3 flex justify-center">
              <GoogleLogin />
            </div>

            <div className="flex items-center justify-center gap-[3px]">
              <p className="text-center text-sm leading-[1.35] font-medium text-[#5c5c5c]">Forgot Password? </p>
              <Link href={AppRoutes.auth.forgotPassword.path}>
                <p className="text-center text-sm leading-[1.35] font-medium text-white">Reset</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mx-auto flex w-full max-w-[440px] flex-col items-center gap-5">
        <div className="flex w-full">
          <FormBottomDivider />
        </div>
        <FormBottomLink href={AppRoutes.auth.path} infoText="Don't have an account yet?" linkText="Sign Up" />
      </div>
    </div>
  );
}
