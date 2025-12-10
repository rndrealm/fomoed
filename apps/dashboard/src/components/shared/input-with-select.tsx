"use client";
import React, { useRef } from "react";
import { ErrorMessage } from "formik";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { AppSelect } from "../ui/app-select";
import { CustomTextInput } from "./custom-text-input";

interface IErrorMsg {
  name: string;
  className?: string;
}

type PasswordOption = "password" | "text";

export function ErrorMsg(props: IErrorMsg) {
  const { name, className = "" } = props;

  return (
    <ErrorMessage name={name}>{(msg) => <p className={cn("text-xs text-[red]", className)}>{msg}</p>}</ErrorMessage>
  );
}

interface TextInputProps extends React.HTMLProps<HTMLInputElement> {
  rightPlaceholder?: string;
  rightPlaceholderClassName?: string;
  disableFormikError?: boolean;
  selectOptions: Array<{
    label: string;
    value: string;
  }>;
  selectValue: string;
  onChangeSelect: (value: string) => void;
}

export function InputWithSelect(props: TextInputProps) {
  const {
    name = "name",
    className,
    value,
    rightPlaceholder,
    rightPlaceholderClassName,
    disableFormikError = false,
    selectOptions = [],
    selectValue,
    onChangeSelect,
    ...rest
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  // const handleClick = () => {
  //   if (props.type === "number" && inputRef.current) {
  //     inputRef.current.select();
  //   }
  // };

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <CustomTextInput
          ref={inputRef}
          className={cn(
            "h-[50px] w-full rounded-2xl border border-transparent bg-[#151515] px-4 text-base leading-[1.35] font-medium text-white transition selection:bg-white/20 selection:text-white placeholder:text-[#5c5c5c] focus:!border-[#646464] focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:!ring-0",
            className,
          )}
          value={value}
          // onClick={handleClick}
          {...rest}
          name={name}
          id={name}
          type={props.type}
        />
        <div className={cn("flex items-center text-[#626262] text-xxs absolute top-[0%] right-2  gap-1")}>
          <AppSelect
            name="inputSelect"
            options={selectOptions}
            value={selectValue}
            onValueChange={(val) => onChangeSelect(val)}
            className="h-6"
            triggerClassName="border-none w-12.5 p-0 text-xxs gap-0 !text-[#A6AEB2]"
            contentClassName="min-w-0 !bg-[#141416] w-14"
            itemClassName="font-medium !text-[#A6AEB2] text-xxs focus:bg-[#222329]"
            hideIndicator
          />
        </div>
      </div>
      {!disableFormikError && <ErrorMsg name={name} />}
    </div>
  );
}
