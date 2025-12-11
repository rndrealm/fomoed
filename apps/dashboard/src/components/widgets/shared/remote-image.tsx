import dashboard from "@/lib/assets/dashboard";
import Image, { ImageProps } from "next/image";
import React, { useEffect, useState } from "react";

interface RemoteImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  width?: number;
  height?: number;
  className?: string;
  alt: string;
  fallback?: any;
}

const RemoteImage = (props: RemoteImageProps) => {
  const { src, alt, width, height, fallback, className = "", ...rest } = props;

  const fill = width === undefined && height === undefined;
  // console.log("fill:", fill);

  const [imageError, setImageError] = useState(false);
  const fallbackUrl = fallback || dashboard.token;
  useEffect(() => {
    if (!src) return;
    setImageError(false);
  }, [src]);
  return (
    <Image
      src={imageError || !src ? fallbackUrl : src?.trim()}
      alt={alt || "Chain Image"}
      fill={fill}
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
