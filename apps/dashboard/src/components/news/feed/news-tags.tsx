import React from "react";
import { motion } from "motion/react";

interface NewsTagsProps {
  tag: string;
  selectedTag: string;
  stringTag: string;
  setSelectedTag: (tag: string) => void;
}

const NewsTags = (props: NewsTagsProps) => {
  const { tag, stringTag, setSelectedTag, selectedTag } = props;
  return (
    <div className="relative">
      <button
        onClick={() => setSelectedTag(tag)}
        className={`relative z-[2] rounded-[10px] px-4.5 py-1 text-[14px] font-bold ${
          selectedTag === tag ? "text-white" : "text-[#C3C3C3]"
        }`}
      >
        {stringTag}
      </button>
      {selectedTag === tag ? (
        <motion.div className="absolute inset-0 z-[1] rounded-[10px] bg-[#FF5C02]" layoutId="news-tags" />
      ) : null}
    </div>
  );
};

export default NewsTags;
