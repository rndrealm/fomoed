import React, { FC, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PayoutItem } from "@/services/queries/referral/types";

interface PayoutsListProps {
  payouts: PayoutItem[];
}

const PayoutsList: FC<PayoutsListProps> = ({ payouts }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-zinc-400";
    }
  };

  const getEligibilityColor = (eligibility: string) => {
    return eligibility === "Eligible" ? "text-green-500" : "text-zinc-400";
  };

  const totalPages = Math.ceil(payouts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPayouts = payouts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (payouts.length === 0) {
    return (
      <div className="bg-[#121212] border-[#121212] rounded-xl p-8 text-center text-zinc-400">No payouts found</div>
    );
  }

  return (
    <div className="bg-[#121212] border-[#121212] rounded-xl overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left p-4 text-sm text-zinc-400 font-medium">Email</th>
              <th className="text-left p-4 text-sm text-zinc-400 font-medium">Status</th>
              <th className="text-left p-4 text-sm text-zinc-400 font-medium">Amount</th>
              <th className="text-left p-4 text-sm text-zinc-400 font-medium">Billing Period Start</th>
              <th className="text-left p-4 text-sm text-zinc-400 font-medium">Payout Eligible Date</th>
              <th className="text-left p-4 text-sm text-zinc-400 font-medium">Eligibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {currentPayouts.map((payout, index) => (
              <tr key={startIndex + index} className="hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 text-sm text-white truncate max-w-xs" title={payout.email}>
                  {payout.email}
                </td>
                <td className="p-4 text-sm">
                  <span className={`font-medium capitalize ${getStatusColor(payout.status)}`}>{payout.status}</span>
                </td>
                <td className="p-4 text-sm text-white font-medium">${payout.amount.toFixed(2)}</td>
                <td className="p-4 text-sm text-zinc-400">{formatDate(payout.billing_period_start)}</td>
                <td className="p-4 text-sm text-zinc-400">{formatDate(payout.payout_eligible_date)}</td>
                <td className="p-4 text-sm">
                  <span className={`font-medium ${getEligibilityColor(payout.eligibility)}`}>{payout.eligibility}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-700">
        {/* Rows per page selector */}
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
            {startIndex + 1}-{Math.min(endIndex, payouts.length)} of {payouts.length}
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
    </div>
  );
};

export default PayoutsList;
