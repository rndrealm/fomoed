import React from "react";

interface IProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  widthFull?: boolean;
}

export function SkeletonLoader(props: IProps) {
  const {
    borderRadius = "30",
    height = "16",
    width = "100",
    widthFull = false,
  } = props;

  return (
    <div
      style={{
        width: widthFull ? "100%" : `${width}px`,
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
      }}
      className="app_skeleton_loader"
    ></div>
  );
}
