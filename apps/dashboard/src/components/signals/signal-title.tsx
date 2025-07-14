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
    <div className="flex items-center border-b border-white/30 pb-2">
      <input
        type="text"
        placeholder="Enter what you wanna get notified about..."
        className="flex-1 bg-transparent outline-none text-white placeholder-white/40 text-2xl font-semibold"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />

      {children}
    </div>
  );
};

export default SignalTitle;
