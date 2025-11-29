"use client";
import React from "react";
import { useAtomValue } from "jotai";
import { formStepAtom } from "@/lib/atoms/waitlist";

export function FormStep() {
  const step = useAtomValue(formStepAtom);

  if (step > 7) return null;

  return <p className="font-light text-white text-sm leading-[20px] tracking-[6%]">0{step}</p>;
}
