"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { attendanceAPI } from "../../../../Apis/attendance.jsx";

const STATUS_COLORS = {
  Present: "bg-green-100 text-green-700",
  Absent: "bg-red-100 text-red-700",
  Late: "bg-yellow-100 text-yellow-700",
  LEAVE: "bg-blue-100 text-blue-700",
  NONS: "bg-gray-100 text-gray-700",
};

export default function EmployeeAttendanceHistoryPage() {
  const { employee_id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);

  // frontend filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 20,
  });

  // range mode
  const [useRange, setUseRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchHistory = async () => {
    if (!employee_id) return;
    try {
      setLoading(true);
      setError(null);

      // if range mode and both dates are set → hit range API
      if (useRange && startDate && endDate) {
        const res = await attendanceAPI.GET_BY_EMPLOYEE_RANGE(employee_id, {
          start: startDate,
          end: endDate,
          page,
          limit,
        });

        const rows = Array.isArray(res) ? res : res?.data || [];
        setRecords(rows);
        setMeta(
          res?.meta || {
            total: rows.length,
            page,
            limit,
            totalPages: 1,
          }
        );
      } else {
        // normal paginated history
        const res = await attendanceAPI.GET_BY_EMPLOYEE(employee_id, {
          page,
          limit,
        });
        const rows = Array.isArray(res) ? res : res?.data || [];
        setRecords(rows);
        setMeta(
          res?.meta || {
            total: rows.length,
            page,
            limit,
            totalPages: 1,
          }
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load attendance history"
      );
      setRecords([]);
      setMeta({ total: 0, page: 1, totalPages: 1, limit });
    } finally {
      setLoading(false);
    }
  };

  // load when employee / page / mode / selected range changes
  useEffect(() => {
    fetchHistory();
  }, [employee_id, page, useRange, startDate, endDate]);

  // frontend filters on current page
  const filtered = records.filter((rec) => {
    const okStatus =
      statusFilter === "all" ? true : rec.status === statusFilter;
    const okDate = dateFilter ? rec.attendance_date === dateFilter : true;
    return okStatus && okDate;
  });

  return (
    <section className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <button
            onClick={() => router.push("/dashboard/attendance")}
            className="text-xs text-gray-500 mb-2 hover:text-gray-700"
          >
            ← Back to attendance list
          </button>
          <h2 className="text-lg font-semibold">
            Attendance history — {employee_id}
          </h2>
          <p className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages} • {meta.total} total records
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All status</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="LEAVE">Leave</option>
            <option value="NONS">NONS</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          {/* toggle range mode */}
          <label className="inline-flex items-center gap-1 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={useRange}
              onChange={(e) => {
                setUseRange(e.target.checked);
                setPage(1);
              }}
            />
            Range
          </label>
        </div>
      </div>

      {/* Range inputs (only if enabled) */}
      {useRange && (
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div>
            <label className="text-xs text-gray-500">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="mt-1 rounded-md border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="mt-1 rounded-md border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        
        </div>
      )}

      {/* Error / Loading */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md mb-4">
          {error}
        </p>
      )}
      {loading && <p className="text-sm text-gray-500">Loading history…</p>}

      {/* Table */}
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Note</th>
              <th className="px-3 py-2 font-medium">History</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    No attendance records for this employee.
                  </td>
              </tr>
            ) : (
              filtered.map((rec) => (
                <tr key={rec._id}>
                  <td className="px-3 py-3 whitespace-nowrap text-gray-700">
                    {rec.attendance_date}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md ${
                        STATUS_COLORS[rec.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    {rec.note || "—"}
                  </td>
                  <td className="px-3 py-3">
                    {rec.history && rec.history.length > 0 ? (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-500">
                          {rec.history.length} change
                          {rec.history.length > 1 ? "s" : ""}
                        </summary>
                        <div className="mt-2 space-y-1 max-h-44 overflow-y-auto pr-1">
                          {rec.history
                            .slice()
                            .reverse()
                            .map((h, i) => (
                              <div
                                key={i}
                                className="bg-gray-50 rounded-md px-2 py-1"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium">
                                    {h.status}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {h.changed_at
                                      ? new Date(
                                          h.changed_at
                                        ).toLocaleString()
                                      : ""}
                                  </span>
                                </div>
                                {h.note && (
                                  <p className="text-[11px] text-gray-500">
                                    {h.note}
                                  </p>
                                )}
                                {h.extra_note && (
                                  <p className="text-[11px] text-gray-500">
                                    Reason: {h.extra_note}
                                  </p>
                                )}
                                {h.changed_by && (
                                  <p className="text-[10px] text-gray-400">
                                    by: {h.changed_by}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      </details>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div>
          Page {meta.page} of {meta.totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={meta.page <= 1}
            className={`px-3 py-1.5 rounded-md border ${
              meta.page <= 1
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            Prev
          </button>
          <button
            onClick={() =>
              setPage((p) => (p < meta.totalPages ? p + 1 : p))
            }
            disabled={meta.page >= meta.totalPages}
            className={`px-3 py-1.5 rounded-md border ${
              meta.page >= meta.totalPages
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
