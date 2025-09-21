"use client";
import React, { Suspense, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { FormBottomLink, GoogleLogin, SubmitButton, TextInput } from "@/components/auth";
import ArrowRight from "@/components/icons/ArrowRight";
import FormLogo from "@/components/icons/FormLogo";
import FormBottomDivider from "@/components/icons/FormBottomDivider";
import { AppRoutes } from "@/lib/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { track } from "@vercel/analytics";
import { signUpNewUser } from "@/services/queries/auth/server-actions";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Please enter a valid email address").required("Please enter your email address"),
  username: Yup.string().required("Please enter your username"),
  password: Yup.string()
    .required("Please enter your password")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

const initialValues = {
  username: "",
  email: "",
  password: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

export default function Page() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

const SignupForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("from");
  const onSubmit = async (_values: InitialValues) => {
    try {
      setIsLoading(true);
      const retUser = await signUpNewUser(_values, fromUrl);
      if (retUser.success) {
        track("signup", {
          username: _values.username,
          email: _values.email,
        });
        // Redirect to full url on signup

        router.push(AppRoutes.auth.mailAuthenticate.path);
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
    <div className="font-inter flex min-h-screen w-full flex-col bg-[#000] px-4 pb-8">
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="flex w-full max-w-[418px] flex-col gap-5">
          <div className="relative flex justify-center">
            <FormLogo />
          </div>
          <div className="relative rounded-2xl">
            <div className="auth_border"></div>
            <div className="relative flex w-full flex-col gap-8 rounded-2xl bg-[#080808] px-6 py-[48px]">
              <div className="mx-auto flex max-w-[313px] flex-col gap-2">
                <h3 className="text-center text-xl leading-[1.35] font-medium text-white">
                  Create an Account on Fomoed
                </h3>
                <p className="text-center text-base leading-[1.35] font-medium text-[#5f5f5f]">
                  Create an account and never miss out on anything again.
                </p>
                <div className="mt-4 rounded-lg border border-gray-600/30 bg-gray-800/30 p-3">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-300">No Credit Card Required</span>
                  </div>
                </div>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                validateOnBlur={false}
                validateOnMount={false}
                validateOnChange={false}
              >
                {(props) => {
                  const { values, handleChange, handleBlur, handleSubmit } = props;

                  return (
                    <form onSubmit={handleSubmit} className="">
                      <div className="flex flex-col gap-4">
                        <TextInput
                          name="username"
                          id="username"
                          placeholder="username"
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />

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
                          <SubmitButton isLoading={isLoading}>
                            Continue
                            <ArrowRight fill={"#7d7d7d"} />
                          </SubmitButton>
                        </div>
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </div>

          <div className="relative mt-3 flex justify-center">
            <GoogleLogin fromUrl={fromUrl || undefined} />
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[440px] flex-col items-center gap-5">
        <div className="flex w-full">
          <FormBottomDivider />
        </div>
        <FormBottomLink
          href={fromUrl ? `${AppRoutes.auth.login.path}?from=${fromUrl}` : AppRoutes.auth.login.path}
          infoText="Already on Fomoed?"
          linkText="Sign In"
        />
      </div>
    </div>
  );
};
