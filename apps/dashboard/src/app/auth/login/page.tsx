"use client";
import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { FormBottomLink, SubmitButton, TextInput } from "@/components/auth";
import ArrowRight from "@/components/icons/ArrowRight";
import FormLogo from "@/components/icons/FormLogo";
import { useLoginUser } from "@/services/queries/auth";
import { GoogleLogin } from "@/components/auth/google-login";
import FormBottomDivider from "@/components/icons/FormBottomDivider";
import Link from "next/link";
import { AppRoutes } from "@/lib/routes";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Please enter your email address"),

  password: Yup.string().required("Please enter your password"),
});

const initialValues = {
  email: "",
  password: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

export default function Page() {
  const { mutate, isPending } = useLoginUser();
  const onSubmit = (_values: InitialValues) => {
    console.log("hola:", _values);
    mutate(_values);
  };

  return (
    <div className="min-h-screen w-full bg-[#000] flex flex-col pb-8 px-4">
      <div className="flex items-center justify-center flex-1 h-full">
        <div className="max-w-[418px] w-full  flex flex-col gap-5">
          <div className="flex justify-center">
            <FormLogo />
          </div>
          <div className="flex flex-col gap-12 w-full px-6 py-[48px] border-[#1e1e1e] rounded-2xl border bg-[#080808]">
            <div className="flex flex-col gap-2 max-w-[313px] mx-auto">
              <h3 className="font-medium text-xl leading-[1.35] text-white text-center">
                Welcome Back
              </h3>
              <p className="text-center font-medium text-base leading-[1.35] text-[#5f5f5f]">
                Login to access more tool.
              </p>
            </div>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {(props) => {
                const { values, handleChange, handleBlur, handleSubmit } =
                  props;

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
                        <SubmitButton
                          isLoading={isPending}
                          disabled={isPending}
                        >
                          Login
                          <ArrowRight />
                        </SubmitButton>
                      </div>
                    </div>
                  </form>
                );
              }}
            </Formik>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex justify-center mt-3">
              <GoogleLogin />
            </div>

            <div className="flex items-center justify-center gap-[2px]">
              <p className="text-center font-medium text-sm leading-[1.35] text-[#5c5c5c]">
                Forgot Password?{" "}
              </p>
              <Link href={AppRoutes.auth.forgotPassword.path}>
                <p className="text-center font-medium text-sm leading-[1.35] text-white">
                  Reset
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-5 max-w-[440px] w-full mx-auto">
        <div className="flex w-full">
          <FormBottomDivider />
        </div>
        <FormBottomLink href={AppRoutes.auth.path} linkText="Sign Up" />
      </div>
    </div>
  );
}
