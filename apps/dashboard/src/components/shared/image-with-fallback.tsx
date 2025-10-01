import React from "react";
import Image, { ImageProps } from "next/image";
import news from "@/lib/assets/news";
import { RenderIf } from "./render-if";

type IProps = ImageProps & {
  text?: string;
};

export function ImageWithFallback(props: IProps) {
  const { src, alt, text, ...restProps } = props;
  const [error, setError] = React.useState(false);

  return (
    <div className="relative w-full h-full" key={src?.toString()}>
      <Image
        src={error ? news.fallback : src || news.fallback}
        alt={alt || "Image description"}
        onError={() => {
          setError(true);
        }}
        onLoad={() => {
          setError(false);
        }}
        {...restProps}
      />
      <RenderIf condition={error && !!text}>
        <div className="absolute top-26 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <p className="-translate-y-1/2 text-white text-center uppercase font-semibold text-xl">{text}</p>
        </div>
      </RenderIf>
    </div>
  );
}
