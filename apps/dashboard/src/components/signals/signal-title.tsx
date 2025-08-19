import React, { FunctionComponent, useRef, useEffect, useMemo } from "react";
import classNames from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

interface SignalTitleProps {
  title: string;
  loading?: boolean;
  onTitleChange: (title: string) => void;
  onRowCountChange?: (rowCount: number) => void;
}

const SignalTitle: FunctionComponent<SignalTitleProps> = ({
  title,
  onTitleChange,
  onRowCountChange,
  loading = false,
}: SignalTitleProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set height to scrollHeight to expand based on content
      textarea.style.height = `${textarea.scrollHeight}px`;

      // Calculate number of rows based on line height
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const rows = Math.round(textarea.scrollHeight / lineHeight);

      // Call the callback if provided
      if (onRowCountChange) {
        onRowCountChange(rows);
      }
    }
  }, [title, onRowCountChange]);

  const placeholder = useMemo(() => {
    if (loading) return "";

    return "Enter what you wanna get notified about...";
  }, [loading]);

  return (
    <div
      className={classNames(
        "border border-white/30 w-full rounded-md px-4 py-3 duration-500",
        { "animate-pulse bg-white/20": loading },
      )}
    >
      <AnimatePresence mode="wait">
        <motion.textarea
          key="textarea"
          ref={textareaRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          placeholder={placeholder}
          className={classNames(
            "bg-transparent outline-none text-white placeholder-white/40 text-2xl font-medium w-full resize-none overflow-hidden transition-colors duration-500",
            { "!text-transparent": loading },
          )}
          value={title}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onTitleChange(e.target.value)
          }
          rows={1}
          spellCheck="false"
        />
      </AnimatePresence>
    </div>
  );
};

export default SignalTitle;
