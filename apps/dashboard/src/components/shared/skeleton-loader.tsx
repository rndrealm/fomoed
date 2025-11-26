import React from "react";

interface IProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  widthFull?: boolean;
  heightFull?: boolean;
  backgroundColor?: string;
}

export function SkeletonLoader(props: IProps) {
  const {
    borderRadius = "30",
    height = "16",
    width = "100",
    widthFull = false,
    heightFull = false,
    backgroundColor,
  } = props;

  return (
    <div
      style={{
        width: widthFull ? "100%" : `${width}px`,
        height: heightFull ? "100%" : `${height}px`,
        borderRadius: `${borderRadius}px`,
        backgroundColor,
      }}
      className="app_skeleton_loader"
    ></div>
  );
}
