import React from "react";

interface IChevronRight {
  width?: string;
  height?: string;
}

const ChevronRight = (props: IChevronRight) => {
  const { width, height } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || "14"}
      height={height || "14"}
      fill="none"
      viewBox="0 0 14 14"
    >
      <path
        fill="#B9B9B9"
        d="M8.444 7 4.156 2.713a.68.68 0 0 1-.211-.518q.007-.3.226-.518a.7.7 0 0 1 .518-.219q.298 0 .517.22l4.477 4.49q.176.177.263.395t.087.437a1.17 1.17 0 0 1-.35.831l-4.491 4.492a.67.67 0 0 1-.51.211.73.73 0 0 1-.511-.226.7.7 0 0 1-.219-.517q0-.3.219-.518z"
      ></path>
    </svg>
  );
};

export default ChevronRight;
