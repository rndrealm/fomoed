import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { SubmitButton, TextInput } from "../auth";
import { Enter } from "../icons/icons";

const validationSchema = Yup.object().shape({
  asset_name: Yup.string().required("Please enter asset name"),
});

const initialValues = {
  asset_name: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  handleSubmit: (values: InitialValues) => void;
  initialValues: InitialValues;
}

export default function Step6(props: IProps) {
  const { handleSubmit, initialValues } = props;

  const onSubmit = (_values: InitialValues) => {
    handleSubmit(_values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      // validateOnBlur={false}
      // validateOnMount={false}
      // validateOnChange={false}
    >
      {(props) => {
        const { values, handleChange, handleBlur, handleSubmit } = props;

        return (
          <form onSubmit={handleSubmit} className="">
            <div className="flex flex-col gap-9">
              <div className="flex flex-col gap-4">
                <p className="text-white leading-[24px] text-base tracking-[-0.6%]">What&apos;s the asset name?</p>
                <TextInput
                  aria-label="Asset"
                  name="asset_name"
                  id="asset_name"
                  placeholder="Type your answer..."
                  value={values.asset_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="rounded-xl h-[48px] p-3 text-sm"
                />

                <div className="flex items-center justify-center gap-1">
                  <p className="font-light text-xs leading-[20px] tracking-[-0.6%] text-white">press enter</p>
                  <Enter />
                </div>
              </div>

              <div className="">
                <SubmitButton
                  isLoading={false}
                  disabled={false}
                  className="text-xs font-medium leading-[16px] tracking-[-0.4%] text-[#000] rounded-lg"
                >
                  Continue
                </SubmitButton>
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
}
