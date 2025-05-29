import dashboard from "@/lib/assets/dashboard";
import Image, { ImageProps } from "next/image";
import React, { useEffect, useState } from "react";

interface RemoteImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  width: number;
  height: number;
  className?: string;
  alt: string;
}

const RemoteImage = (props: RemoteImageProps) => {
  const { src, alt, width, height, className = "", ...rest } = props;
  const [imageError, setImageError] = useState(false);
  const fallbackUrl = dashboard.token;
  useEffect(() => {
    if (!src) return;
    setImageError(false);
  }, [src]);
  return (
    <Image
      src={imageError || !src ? fallbackUrl : src}
      alt={alt || "Chain Image"}
      width={width}
      height={height}
      className={className}
      unoptimized
      style={{ width, height }}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
      {...rest}
    />
  );
};

export default RemoteImage;
