import React, { FunctionComponent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

interface SignalTitleProps {
  children?: React.ReactNode;
  title: string;
  loading?: boolean;
  onTitleChange: (title: string) => void;
}

const SignalTitle: FunctionComponent<SignalTitleProps> = ({
  title,
  onTitleChange,
  children,
  loading = false,
}: SignalTitleProps) => {
  return (
    <div className="flex items-center gap-x-6">
      <div className="border-b border-white/30 border-dashed w-full">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-10"
            >
              <Skeleton className="flex-1 h-7 bg-white/20 mb-1" />
            </motion.div>
          ) : (
            <motion.input
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              type="text"
              placeholder="Enter what you wanna get notified about..."
              className="flex-1 bg-transparent outline-none text-white placeholder-white/40 text-2xl font-semibold pb-2 w-full h-10"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onTitleChange(e.target.value)
              }
            />
          )}
        </AnimatePresence>
      </div>

      {children}
    </div>
  );
};

export default SignalTitle;
