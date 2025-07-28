import React, { FunctionComponent } from "react";

interface SignalTitleProps {
  children?: React.ReactNode;
  title: string;
  onTitleChange: (title: string) => void;
}

const SignalTitle: FunctionComponent<SignalTitleProps> = ({
  title,
  onTitleChange,
  children,
}: SignalTitleProps) => {
  return (
    <div className="flex items-center gap-x-6">
      <input
        type="text"
        placeholder="Enter what you wanna get notified about..."
        className="flex-1 bg-transparent outline-none text-white placeholder-white/40 text-2xl font-semibold border-b border-white/30 pb-2 border-dashed"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />

      {children}
    </div>
  );
};

export default SignalTitle;
