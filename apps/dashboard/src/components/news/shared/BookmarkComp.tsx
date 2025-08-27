import React from "react";
import { BookmarkV2 } from "../../icons/icons";
import {
  useCheckNewsBookmark,
  useAddNewsBookmark,
  useDeleteNewsBookmark,
} from "@/services/queries/news";
import { motion } from "motion/react";

interface BookmarkCompProps {
  newsId: string;
}

const BookmarkComp = ({ newsId }: BookmarkCompProps) => {
  const { isBookmarked, isPending: isCheckingBookmark } =
    useCheckNewsBookmark(newsId);
  const addBookmark = useAddNewsBookmark();
  const deleteBookmark = useDeleteNewsBookmark();

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      deleteBookmark.mutate(newsId);
    } else {
      addBookmark.mutate(newsId);
    }
  };

  const isLoading =
    isCheckingBookmark || addBookmark.isPending || deleteBookmark.isPending;

  const variants = {
    default: {
      scale: 1,
      transition: { ease: [0.4, 0, 0.2, 1], duration: 0.125 },
    },
    small: {
      scale: 0.825,
      transition: { ease: [0.4, 0, 0.2, 1], duration: 0.175 },
    },
  };

  return (
    <motion.button
      onClick={() => {
        if (isLoading) return;
        handleBookmarkToggle();
      }}
      type="button"
      variants={variants}
      whileTap="small"
      className={`rounded p-1 transition-colors disabled:opacity-50 ${isLoading ? "animate-pulse" : ""}`}
    >
      <BookmarkV2
        fill={isBookmarked ? "#fff" : "transparent"}
        stroke={isBookmarked ? "transparent" : "#5F5F5F"}
      />
    </motion.button>
  );
};

export default BookmarkComp;
