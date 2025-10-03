import React, { FC, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { StatsData, ChartData, SubscriberItem } from "@/services/queries/referral/types";

interface SubscribersListProps {
  subscribers: SubscriberItem[];
}

const SubscribersList: FC<SubscribersListProps> = ({ subscribers }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(subscribers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentSubscribers = subscribers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="bg-[#121212] border border-[#1a1a1a] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-zinc-800 text-sm text-zinc-400 font-medium">
          <div className="col-span-1">EMAIL</div>
          <div className="col-span-1">STATUS</div>
          <div className="col-span-1 text-right">EARNINGS</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-zinc-800">
          {subscribers && subscribers.length > 0 ? (
            currentSubscribers.map((subscriber) => (
              <div
                key={subscriber.referred_user_id}
                className="grid grid-cols-3 gap-4 px-6 py-4 items-center hover:bg-zinc-900/50 transition-colors"
              >
                <div className="col-span-1 text-zinc-200">{subscriber.referred_user_email}</div>
                <div className="col-span-1">
                  <span className="underline text-zinc-300">{subscriber.referral_status} Subscriber</span>
                </div>
                <div
                  className={`col-span-1 text-right font-medium ${
                    subscriber.total_earnings > 0 ? "text-green-400" : "text-zinc-400"
                  }`}
                >
                  ${subscriber.total_earnings.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-400">You have no referred subscribers yet.</div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {subscribers && subscribers.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="bg-zinc-800 text-white rounded px-2 py-1 border border-zinc-700 focus:outline-none focus:border-zinc-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Page info and navigation */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              {startIndex + 1}-{Math.min(endIndex, subscribers.length)} of {subscribers.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-400" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        currentPage === pageNum ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribersList;
