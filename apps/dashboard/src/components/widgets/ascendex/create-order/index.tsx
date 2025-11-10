import React from "react";
import { FormContent } from "./form";
import { Overview } from "./overview";
import { Formik } from "formik";
import * as Yup from "yup";

const initialValues = {
  price: "101823",
  quantity: "",
  reduceOnly: false,
  tif: "Gtc",
};

export type TradingFormInitialValues = ReturnType<() => typeof initialValues>;

export default function CreateOrder() {
  const validationSchema = Yup.object().shape({
    price: Yup.number().min(0.01, "Price must be greater than 0").required("Please enter price"),
    quantity: Yup.number().min(0, "Quantity must be a positive number").required("Please enter quantity"),
    reduceOnly: Yup.boolean(),
    tif: Yup.string().oneOf(["Gtc", "Ioc", "Alo"]).required("Please select Time in Force"),
  });

  function onSubmit(_values: TradingFormInitialValues) {
    console.log("submit", _values);
  }

  return (
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
          <form onSubmit={handleSubmit} className="w-[210px] h-full block">
            <div className="w-full flex flex-col flex-1 gap-2">
              <div className="bg-[#121317] rounded-[10px] pt-2 px-3 pb-4">
                <FormContent />
              </div>

              <div className="bg-[#121317] rounded-[10px] p-3">
                <Overview />
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
}
