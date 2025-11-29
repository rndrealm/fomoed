import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { SubmitButton, TextInput } from "../auth";
import { Enter } from "../icons/icons";

const validationSchema = Yup.object().shape({
  biggest_win: Yup.string().required("Please enter your biggest win in USD"),
});

const initialValues = {
  biggest_win: "",
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  handleSubmit: (values: InitialValues) => void;
  initialValues: InitialValues;
}

export default function Step4(props: IProps) {
  const { handleSubmit, initialValues } = props;

  const onSubmit = (_values: InitialValues) => {
    const transformedValues = {
      ..._values,
      biggest_win: _values.biggest_win.toString(),
    };
    handleSubmit(transformedValues);
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
                <p className="text-white leading-[24px] text-base tracking-[-0.6%]">
                  What&apos;s your biggest win in USD?
                </p>
                <TextInput
                  type="number"
                  aria-label="Win in USD"
                  name="biggest_win"
                  id="biggest_win"
                  placeholder="$ 0.00"
                  value={values.biggest_win}
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
