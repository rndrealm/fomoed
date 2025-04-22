"use client";
import React from "react";
import { ErrorMessage } from "formik";
import { Input } from "../ui/input";

interface IErrorMsg {
  name: string;
}

function ErrorMsg(props: IErrorMsg) {
  const { name } = props;

  return (
    <ErrorMessage name={name}>
      {(msg) => <p className="text-xs text-[red]">{msg}</p>}
    </ErrorMessage>
  );
}

// interface IProps extends React.HTMLProps<HTMLInputElement> {

// }

export function TextInput(props: React.HTMLProps<HTMLInputElement>) {
  const { name = "name", value, ...rest } = props;

  return (
    <div className="flex flex-col gap-1">
      <Input
        className="
          h-[50px] 
          px-4 
          placeholder:text-[#5c5c5c] 
          bg-[#0c0c0c] 
          border 
          border-transparent 
          focus:outline-none 
          focus:ring-0 
          focus:ring-offset-0 
          focus:shadow-none
          focus-visible:!ring-0
          focus:!border-[#646464] 
          transition
          font-medium text-base leading-[1.35] text-white w-full
          rounded-2xl
        "
        value={value}
        {...rest}
      />
      <ErrorMsg name={name} />
    </div>
  );
}
