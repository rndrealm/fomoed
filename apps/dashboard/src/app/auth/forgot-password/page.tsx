"use client";
import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { FormBottomLink, SubmitButton, TextInput } from "@/components/auth";
import ArrowRight from "@/components/icons/ArrowRight";
import FormLogo from "@/components/icons/FormLogo";
import FormBottomDivider from "@/components/icons/FormBottomDivider";
import { useForgotPassword } from "@/services/queries/auth";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Please enter your email address"),
});

const initialValues = {
  email: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

export default function Page() {
  const { mutate, isPending } = useForgotPassword();
  const onSubmit = (_values: InitialValues) => {
    mutate(_values);
    console.log(_values);
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
                Reset Password
              </h3>
              <p className="text-center font-medium text-base leading-[1.35] text-[#5f5f5f]">
                we’ll send you a link to reset your password
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

                      <div className="">
                        <SubmitButton
                          isLoading={isPending}
                          disabled={isPending}
                        >
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
      <div className="flex flex-col items-center gap-5 max-w-[440px] w-full mx-auto">
        <div className="flex w-full">
          <FormBottomDivider />
        </div>
        <FormBottomLink href="#" infoText="Return To" linkText="Sign In" />
      </div>
    </div>
  );
}
