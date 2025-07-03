import React from "react";

interface ISectionTitle {
  title: string;
}

export function ShortcutTitle(props: ISectionTitle) {
  const { title } = props;

  return (
    <div className="py-3 px-4">
      <p className="text-xs text-[#A4A4A4] leading-[16px]">{title}</p>
    </div>
  );
}
