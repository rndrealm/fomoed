"use client";
import React, { Dispatch, useEffect, useRef, useState } from "react";
import { ErrorMessage } from "formik";
import { Input } from "../ui/input";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { RenderIf } from "../shared";
import { SetStateAction } from "jotai";

interface IErrorMsg {
  name: string;
}

type PasswordOption = "password" | "text";

function ErrorMsg(props: IErrorMsg) {
  const { name } = props;

  return <ErrorMessage name={name}>{(msg) => <p className="text-xs text-[red]">{msg}</p>}</ErrorMessage>;
}

export function TextInput(props: React.HTMLProps<HTMLInputElement>) {
  const { name = "name", value, ...rest } = props;
  const [showPassword, setShowPassword] = useState<PasswordOption>(props.type === "password" ? "password" : "text");

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <Input
          className="h-[50px] w-full rounded-2xl border border-transparent bg-[#151515] px-4 text-base leading-[1.35] font-medium text-white transition selection:bg-white/20 selection:text-white placeholder:text-[#5c5c5c] focus:!border-[#646464] focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:!ring-0"
          value={value}
          {...rest}
          type={props.type === "password" ? showPassword : props.type}
        />
        <RenderIf condition={props.type === "password"}>
          <PasswordText showPassword={showPassword} setShowPassword={setShowPassword} />
        </RenderIf>
      </div>
      <ErrorMsg name={name} />
    </div>
  );
}

interface IPasswordText {
  showPassword: PasswordOption;
  setShowPassword: Dispatch<SetStateAction<PasswordOption>>;
}

const PasswordText = ({ showPassword, setShowPassword }: IPasswordText) => {
  const targetText = useRef(showPassword === "password" ? "show" : "hide");
  const [displayText, setDisplayText] = useState(targetText.current);
  const [isAnimating, setIsAnimating] = useState(false);

  const startShuffle = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const newTarget = showPassword === "password" ? "hide" : "show";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let iteration = 0;
    const maxIterations = 10;

    const interval = setInterval(() => {
      iteration++;

      if (iteration < maxIterations) {
        let scrambled = "";
        for (let i = 0; i < newTarget.length; i++) {
          // As iterations progress, more characters match the target
          if (iteration / maxIterations > i / newTarget.length) {
            scrambled += newTarget[i];
          } else {
            scrambled += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        setDisplayText(scrambled);
      } else {
        clearInterval(interval);
        setDisplayText(newTarget);
        targetText.current = newTarget;
        setIsAnimating(false);
      }
    }, 40);
  };
  return (
    <button
      type="button"
      className="absolute top-[25%] right-6 h-6 w-6 cursor-pointer"
      onClick={() => {
        startShuffle();
        setShowPassword(showPassword === "password" ? "text" : "password");
      }}
    >
      <motion.span className="text-xs font-medium text-[#5c5c5c]">{displayText}</motion.span>
    </button>
  );
};
