"use client";

import SearchIcon from "@/components/icons/SearchIcon";
import { useEffect, useRef } from "react";
import CloseIcon from "@/components/icons/CloseIcon";
import { useQueryState } from "nuqs";
import { useSearchNews } from "@/services/queries/news";
import { RelatedArticleCardV2 } from "@/components/news/related-articles/related-articles-card-v2";
import { useDebounce } from "@/hooks/useDebounce";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";

const NoNewsSvg = () => {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="186" height="264" transform="translate(124 68)" fill="#0F0F0F" />
      <path d="M0 69H400" stroke="#0F0F0F" strokeWidth="2.5" />
      <path d="M310 400L310 5.00679e-06" stroke="#0F0F0F" strokeWidth="2.5" />
      <path d="M124 400L124 5.00679e-06" stroke="#0F0F0F" strokeWidth="2.5" />
      <path d="M0 332H400" stroke="#0F0F0F" strokeWidth="2.5" />
    </svg>
  );
};

const LoadingState = () => {
  return (
    <div className="xs:grid-cols-1 grid w-full grid-cols-1 items-start justify-center gap-5 text-white sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="max-w-[17rem]">
          <ArticleSkeleton />
        </div>
      ))}
    </div>
  );
};

const ArticleSkeleton = () => {
  return (
    <div>
      {/* Header with token pills and bookmark */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <SkeletonLoader height={24} width={48} borderRadius={30} />
          <SkeletonLoader height={24} width={64} borderRadius={30} />
        </div>
        <SkeletonLoader height={20} width={20} borderRadius={4} />
      </div>

      {/* Image skeleton */}
      <div className="relative">
        <SkeletonLoader height={291} widthFull borderRadius={16} />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2 pt-2">
        <SkeletonLoader height={12} width={80} borderRadius={4} />
        <SkeletonLoader height={20} widthFull borderRadius={4} />
        <SkeletonLoader height={20} width={210} borderRadius={4} />
        <SkeletonLoader height={12} width={64} borderRadius={4} />
      </div>
    </div>
  );
};

const EmptySearchState = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <NoNewsSvg />
      <div className="flex flex-col items-center justify-center gap-1.5">
        <div className="flex flex-col items-center justify-center gap-1.5">
          <p className="text-base font-medium text-white">Search for news articles</p>
          <p className="text-xs font-semibold text-[#A4A4A4]">Type in the search box above to find relevant articles</p>
        </div>
      </div>
    </div>
  );
};

const NoResultsState = ({ searchTerm }: { searchTerm: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <NoNewsSvg />
      <div className="flex flex-col items-center justify-center gap-1.5">
        <p className="text-base font-medium text-white">No articles found</p>
        <p className="text-xs font-semibold text-[#A4A4A4]">
          No results for &quot;{searchTerm}&quot;. Try different keywords
        </p>
      </div>
    </div>
  );
};

const ErrorState = ({ error }: { error: Error }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <NoNewsSvg />
      <div className="flex flex-col items-center justify-center gap-1.5">
        <div className="flex flex-col items-center justify-center gap-1.5">
          <p className="text-base font-medium text-white">Something went wrong</p>
          <p className="text-xs font-semibold text-[#A4A4A4]">Failed to search articles. Please try again</p>
        </div>
      </div>
    </div>
  );
};

const NewsPopup = ({ setIsSearching }: { setIsSearching: (value: boolean) => void }) => {
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search term to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  const { data, isFetching, error } = useSearchNews(debouncedSearch, 1, 20, debouncedSearch.trim().length > 0);

  const clearSearch = () => {
    setSearch("");
  };

  // Focus the input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="absolute top-0 left-0 z-40 flex min-h-[calc(100svh-86px)] w-full flex-col items-center justify-start bg-[#000]">
      <div className="xs:w-[85%] relative mx-auto flex h-full w-[90%] flex-col items-center justify-center gap-16 pt-8 sm:w-[80%] md:w-[75%] xl:w-[55%]">
        <div className="relative flex w-full flex-col items-center">
          <div className="md-gap-44 flex w-full flex-row items-center justify-center gap-20">
            {/* Search Input */}
            <div
              style={{
                background:
                  "linear-gradient(120.75deg, #191919 3.66%, #000000 45.76%, #000000 68.73%, #000000 86.75%, #000000 94.89%, #BD4618 104.37%, #7F7F7F 136.85%)",
              }}
              className="group xs:w-[320px] relative w-[280px] rounded-[12px] border-[1px] border-[#2A2A2A] bg-[#0C0C0C] sm:w-[380px] md:w-[480px]"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Articles"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-0.5 w-full py-2 pr-10 pl-[38px] text-[14px] text-[#A4A4A4] outline-none placeholder:text-xs placeholder:font-normal placeholder:text-[#A4A4A4]"
              />
              <div className="absolute top-1/2 left-1 -translate-y-[50%] rounded-[8px] bg-[#232323] px-2 py-1.5">
                <SearchIcon color="#FFF" />
              </div>

              {/* Clear button - shows on hover when there's text */}
              {search.trim() && (
                <button
                  onClick={clearSearch}
                  className="absolute top-1/2 right-2 -translate-y-[50%] rounded-full p-1 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-[#232323]"
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="#A4A4A4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            <button
              className="absolute right-0"
              onClick={() => {
                setIsSearching(false);
                setSearch("");
              }}
            >
              <CloseIcon color="#FFF" />
            </button>
          </div>
        </div>

        {/* News */}
        <div className="mx-auto flex flex-row flex-wrap items-center justify-center gap-5 px-0 pb-4">
          <div className="flex flex-col items-center justify-center gap-5">
            {(() => {
              // Show skeleton loading state while fetching data
              if (isFetching) {
                return <LoadingState />;
              }

              // Show typing loading state when user is typing (debouncing)
              if (search.trim() && search !== debouncedSearch) {
                return <LoadingState />;
              }

              // Show error state if there's an error
              if (error) {
                return <ErrorState error={error} />;
              }

              // Show empty search state if no search term
              if (!debouncedSearch.trim()) {
                return <EmptySearchState />;
              }

              // Show no results state if search term exists but no results
              if (debouncedSearch.trim() && (!data || data.length === 0)) {
                return <NoResultsState searchTerm={debouncedSearch} />;
              }

              // Show results
              return (
                <div className="xs:grid-cols-1 grid w-full grid-cols-1 items-start justify-center gap-5 text-white sm:grid-cols-2 lg:grid-cols-3">
                  {data?.map((article, index) => (
                    <div key={article.id || index} className="max-w-[17rem]">
                      <RelatedArticleCardV2 article={article} />
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPopup;
