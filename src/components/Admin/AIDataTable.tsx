"use client";

import type { Listing } from "@/app/utils/types";
import { useState, useEffect } from "react";
import { getCategoryIDMap } from "@/app/utils/categoryUtils";

interface DataTableProps {
  rows: Listing[];
  pageSize?: number; // optional, defaults to 5
}

const catMap : Map<number, string> = getCategoryIDMap();

export default function DataTable({ rows, pageSize=5 }: DataTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = rows.filter((r) =>
    [r.title, catMap.get(r.category_id)]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  useEffect(() => {
    setPage(0);
  }, [query, rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length/pageSize));
  const start = page * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="space-y-3">
      {/*Search input*/}
      <div className="flex items-center justify-between">
        <input
          className="w-full md:w-80 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder="Search listings…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Seller</Th>
              <Th>Price</Th>
              <Th>Status</Th>
              <Th>Reports</Th>
              <Th>Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <Td>{r.id}</Td>
                <Td>{r.title}</Td>
                <Td>{r.seller_id}</Td>
                <Td>${r.price.toFixed(2)}</Td>
                <Td>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border capitalize">
                    {r.status}
                  </span>
                </Td>
                <Td>{0}</Td>
                <Td>{new Date(r.created_at).toLocaleDateString()}</Td>
                <Td className="text-right">
                  <button className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 mr-2">View</button>
                  <button className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100">More</button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-600">
          <span>
            Showing{" "}
            {filtered.length === 0
              ? 0
              : `${start + 1}-${Math.min(start + pageSize, filtered.length)}`}{" "}
            of {filtered.length}
          </span>

          <div className="space-x-2">
            <button
              type="button"
              onClick={() => canPrev && setPage((p) => Math.max(0, p - 1))}
              disabled={!canPrev}
              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                canNext && setPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={!canNext}
              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function Th({ children, className = "" }: any) {
  return (
    <th className={"px-3 py-2 text-left font-medium " + className}>
      {children}
    </th>
  );
}
function Td({ children, className = "", colSpan }: any & {colSpan? : number}) {
  return (
    <td className={"px-3 py-2 align-middle " + className} colSpan={colSpan}>
      {children}
    </td>
  );
}