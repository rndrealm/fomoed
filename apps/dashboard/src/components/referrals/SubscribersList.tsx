// SubscribersList.tsx
import React, { FC, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { SubscriberItem } from "@/services/queries/referral/types";
import ExcelJS from "exceljs";

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleExportToExcel = async () => {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Active Subscribers");

    // Define columns
    worksheet.columns = [
      { header: "Email", key: "email", width: 40 },
      { header: "Joined Date", key: "joinedDate", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Total Earnings", key: "totalEarnings", width: 15 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 20;

    for (let colNum = 1; colNum <= 4; colNum++) {
      const cell = headerRow.getCell(colNum);
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" }, // Blue header background
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD3D3D3" } },
        left: { style: "thin", color: { argb: "FFD3D3D3" } },
        bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
        right: { style: "thin", color: { argb: "FFD3D3D3" } },
      };
    }

    // Add data rows
    subscribers.forEach((subscriber, index) => {
      const row = worksheet.addRow({
        email: subscriber.email || "N/A",
        joinedDate: formatDate(subscriber.joined_date),
        status: subscriber.status,
        totalEarnings: subscriber.total_earnings,
      });

      // Only apply styling to columns A–D
      const dataColumns = [1, 2, 3, 4];
      dataColumns.forEach((colNum) => {
        const cell = row.getCell(colNum);

        // Gray background for odd rows
        if (index % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F2F2" },
          };
        }

        // Apply borders
        cell.border = {
          top: { style: "thin", color: { argb: "FFD3D3D3" } },
          left: { style: "thin", color: { argb: "FFD3D3D3" } },
          bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
          right: { style: "thin", color: { argb: "FFD3D3D3" } },
        };

        cell.alignment = { vertical: "middle" };
      });

      // Format Total Earnings (D column)
      const earningsCell = row.getCell(4);
      earningsCell.numFmt = "$#,##0.00";
      earningsCell.alignment = { vertical: "middle", horizontal: "right" };
    });

    // Generate file name with current date
    const date = new Date().toISOString().split("T")[0];
    const fileName = `active_subscribers_${date}.xlsx`;

    // Write to buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportToExcel}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>
      <div className="bg-[#121212] border border-[#1a1a1a] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-zinc-800 text-sm text-zinc-400 font-medium">
          <div className="col-span-1">EMAIL</div>
          <div className="col-span-1">JOINED DATE</div>
          <div className="col-span-1">STATUS</div>
          <div className="col-span-1 text-right">EARNINGS</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-zinc-800">
          {subscribers && subscribers.length > 0 ? (
            currentSubscribers.map((subscriber, index) => (
              <div
                key={subscriber.email || index}
                className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-zinc-900/50 transition-colors"
              >
                <div className="col-span-1 text-zinc-200 font-mono text-sm truncate">
                  {subscriber.email || "N/A"}
                </div>
                <div className="col-span-1 text-zinc-300">{formatDate(subscriber.joined_date)}</div>
                <div className="col-span-1">
                  <span className="underline text-zinc-300">{subscriber.status} Subscriber</span>
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
            <div className="p-8 text-center text-zinc-400">You have no active subscribers yet.</div>
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
