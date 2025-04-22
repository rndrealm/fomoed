"use client";
import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { SubmitButton, TextInput } from "@/components/auth";
import ArrowRight from "@/components/icons/ArrowRight";
import FormLogo from "@/components/icons/FormLogo";

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
  const onSubmit = (_values: InitialValues) => {
    console.log(_values);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000]">
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
                      <SubmitButton isLoading={false} disabled={false}>
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
      </div>
    </div>
  );
}
