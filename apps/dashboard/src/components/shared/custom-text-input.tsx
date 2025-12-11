import React, { useRef } from "react";
import { ErrorMessage } from "formik";
import { Input } from "../ui/input";
import { RenderIf } from ".";
import { cn } from "@/lib/utils";

interface IErrorMsg {
  name: string;
  className?: string;
}

export function ErrorMsg(props: IErrorMsg) {
  const { name, className = "" } = props;

  return (
    <ErrorMessage name={name}>{(msg) => <p className={cn("text-xs text-[red]", className)}>{msg}</p>}</ErrorMessage>
  );
}

interface TextInputCleanProps extends React.HTMLProps<HTMLInputElement> {
  rightComponent?: React.ReactNode;
  rightPlaceholder?: string;
  rightPlaceholderClassName?: string;
  disableFormikError?: boolean;
}

export function CustomTextInput(props: TextInputCleanProps) {
  const {
    name = "name",
    className,
    value,
    rightPlaceholder,
    rightPlaceholderClassName,
    rightComponent,
    disableFormikError = false,
    type,
    onChange,
    ...rest
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (type === "number" && inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      // Clean up input to only allow numbers, decimal point, and negative sign
      const cleaned = e.target.value.replace(/[^0-9.-]/g, "");
      // Ensure only one decimal point and one negative sign at the start
      const parts = cleaned.split(".");
      const negativeParts = cleaned.split("-");

      let finalValue = cleaned;
      if (parts.length > 2) {
        finalValue = parts[0] + "." + parts.slice(1).join("");
      }
      if (negativeParts.length > 2) {
        finalValue = "-" + negativeParts.slice(1).join("");
      }

      // Create a new event with the cleaned value
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: finalValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(newEvent);
    } else {
      onChange?.(e);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <Input
          ref={inputRef}
          className={cn(
            "h-[50px] w-full rounded-2xl border border-transparent bg-[#151515] px-4 text-base leading-[1.35] font-medium text-white transition selection:bg-white/20 selection:text-white placeholder:text-[#5c5c5c] focus:!border-[#646464] focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:!ring-0",
            className,
          )}
          value={value}
          onClick={handleClick}
          onChange={handleChange}
          {...rest}
          name={name}
          type={type === "number" ? "text" : type}
        />

        <RenderIf condition={!!rightComponent}>{rightComponent}</RenderIf>

        <RenderIf condition={!!rightPlaceholder}>
          <span
            className={cn(
              "absolute top-[25%] right-2 text-[0.5rem] font-medium text-white pointer-events-none",
              rightPlaceholderClassName,
            )}
          >
            {rightPlaceholder}
          </span>
        </RenderIf>
      </div>
      {!disableFormikError && <ErrorMsg name={name} />}
    </div>
  );
}
