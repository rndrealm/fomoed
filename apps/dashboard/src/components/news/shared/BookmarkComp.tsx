import React from "react";
import { Bookmark } from "../../icons/icons";
import { useCheckNewsBookmark, useAddNewsBookmark, useDeleteNewsBookmark } from "@/services/queries/news";

interface BookmarkCompProps {
  newsId: string;
}

const BookmarkComp = ({ newsId }: BookmarkCompProps) => {
  const { isBookmarked, isPending: isCheckingBookmark } = useCheckNewsBookmark(newsId);
  const addBookmark = useAddNewsBookmark();
  const deleteBookmark = useDeleteNewsBookmark();

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      deleteBookmark.mutate(newsId);
    } else {
      addBookmark.mutate(newsId);
    }
  };

  const isLoading = isCheckingBookmark || addBookmark.isPending || deleteBookmark.isPending;

  return (
    <button
      onClick={handleBookmarkToggle}
      disabled={isLoading}
      className={`rounded p-1 transition-colors disabled:opacity-50 ${isLoading ? "animate-pulse" : ""}`}
    >
      {/* <Bookmark fill={isBookmarked ? "red" : "#5F5F5F"} /> */}
    </button>
  );
};

export default BookmarkComp;
