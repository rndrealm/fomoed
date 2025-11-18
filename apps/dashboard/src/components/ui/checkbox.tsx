import React, { forwardRef, useId } from "react";
import { RenderIf } from "../shared";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  id?: string;
  className?: string;
  labelClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const {
    label,
    checked,
    defaultChecked,
    onCheckedChange,
    name,
    disabled = false,
    required = false,
    value,
    id: providedId,
    className = "",
    labelClassName,
  } = props;

  const generatedId = useId();
  const id = providedId || generatedId;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(event.target.checked);
  };

  const isChecked = checked !== undefined ? checked : undefined;

  return (
    <label
      htmlFor={id}
      className={`flex gap-1 items-center cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          name={name}
          checked={isChecked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          value={value}
          className="sr-only"
          aria-label={label || "Checkbox"}
        />
        <div
          className={`w-[16px] h-[16px] rounded-xs border transition-all ${
            (isChecked ?? defaultChecked) ? "border-[#A6AEB2] bg-[#A6AEB2]" : "border-[#A6AEB2] opacity-[0.16]"
          }`}
        >
          <RenderIf condition={!!(isChecked ?? defaultChecked)}>
            <svg className="w-full h-full p-[2px]" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </RenderIf>
        </div>
      </div>

      <RenderIf condition={!!label}>
        <p
          className={cn(
            "text-[#A6AEB2] text-[8px] font-medium leading-[10px] tracking-[-0.4%] select-none",
            labelClassName,
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </p>
      </RenderIf>
    </label>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;
