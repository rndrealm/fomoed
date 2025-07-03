import React from "react";

interface IShortcutKey {
  letter: string;
}

export function ShortcutKey(props: IShortcutKey) {
  const { letter } = props;

  return (
    <div className="h-[20px] px-1 border border-[#353535] rounded-sm">
      <p className="text-xs leading-[16px] text-white">{letter}</p>
    </div>
  );
}
