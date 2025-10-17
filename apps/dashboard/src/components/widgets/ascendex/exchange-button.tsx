"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";

interface ExchangeButtonProps {
  logoSrc: StaticImageData;
  alt: string;
  imgWidth: number;
  imgHeight: number;
  onClick: () => void;
  disabled?: boolean;
}

export default function ExchangeButton({
  logoSrc,
  alt,
  imgWidth,
  imgHeight,
  onClick,
  disabled = false,
}: ExchangeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-[132px] h-[70px] bg-black hover:bg-[#1a1a1a]
                 border border-[#3c3c3c] rounded-[16px]
                 flex items-center justify-center
                 transition-all duration-200
                 disabled:cursor-not-allowed"
      style={{
        borderWidth: "1px",
        pointerEvents: disabled ? "none" : "auto", 
      }}
    >
      <Image
        src={logoSrc}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        className="object-contain"
      />
    </button>
  );
}
