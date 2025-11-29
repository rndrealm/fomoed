import React from "react";
import { X, Check } from "lucide-react";

export type UploadDate = "all" | "hour" | "today" | "week" | "month" | "year";
export type SortBy = "relevance" | "date" | "viewCount" | "rating";

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadDate: UploadDate;
  sortBy: SortBy;
  onUploadDateChange: (date: UploadDate) => void;
  onSortByChange: (sort: SortBy) => void;
}

export function SearchFilterModal({
  isOpen,
  onClose,
  uploadDate,
  sortBy,
  onUploadDateChange,
  onSortByChange,
}: SearchFilterModalProps) {
  const [tempUploadDate, setTempUploadDate] = React.useState(uploadDate);
  const [tempSortBy, setTempSortBy] = React.useState(sortBy);

  // Reset temp values when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTempUploadDate(uploadDate);
      setTempSortBy(sortBy);
    }
  }, [isOpen, uploadDate, sortBy]);

  if (!isOpen) return null;

  const uploadDateOptions: { value: UploadDate; label: string }[] = [
    { value: "all", label: "Any time" },
    { value: "hour", label: "Last hour" },
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "year", label: "This year" },
  ];

  const sortByOptions: { value: SortBy; label: string }[] = [
    { value: "relevance", label: "Relevance" },
    { value: "date", label: "Upload date" },
    { value: "viewCount", label: "View count" },
    { value: "rating", label: "Rating" },
  ];

  const handleApply = () => {
    onUploadDateChange(tempUploadDate);
    onSortByChange(tempSortBy);
    onClose();
  };

  const handleReset = () => {
    setTempUploadDate("all");
    setTempSortBy("relevance");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-3xl mx-4 bg-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#272727]">
          <h2 className="text-lg font-semibold text-white">Search filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#272727] rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Upload Date</h3>
              <div className="space-y-1">
                {uploadDateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTempUploadDate(option.value)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                      ${
                        tempUploadDate === option.value
                          ? "bg-[#272727] text-white"
                          : "text-[#aaa] hover:bg-[#1f1f1f] hover:text-white"
                      }
                    `}
                  >
                    <span className="text-sm">{option.label}</span>
                    {tempUploadDate === option.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Sort By</h3>
              <div className="space-y-1">
                {sortByOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTempSortBy(option.value)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                      ${
                        tempSortBy === option.value
                          ? "bg-[#272727] text-white"
                          : "text-[#aaa] hover:bg-[#1f1f1f] hover:text-white"
                      }
                    `}
                  >
                    <span className="text-sm">{option.label}</span>
                    {tempSortBy === option.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#272727] bg-[#141414]">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-[#aaa] hover:text-white transition-colors"
          >
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white hover:bg-[#272727] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 text-sm font-medium bg-white text-black hover:bg-gray-200 rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
