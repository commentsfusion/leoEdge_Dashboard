"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { salaryAPI } from "../../../../Apis/salary.jsx";

const SALARY_STATUS_COLORS = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-red-100 text-red-700",
};

export default function EmployeeSalaryHistoryPage() {
  const { employee_id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // you can make this selectable
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  });

  // per-row saving flag (cycle_key)
  const [savingKey, setSavingKey] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // filters (frontend-only)
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // fetcher
  const fetchHistory = async (empId, pageNum, limitNum) => {
    try {
      setLoading(true);
      setError(null);

      // assuming your salaryAPI can send query params
      // e.g. GET /salary/history/:id?page=1&limit=10
      const res = await salaryAPI.GETSALARYBYID(empId, {
        page: pageNum,
        limit: limitNum,
      });

      // backend we wrote: { success, data, meta }
      const rows = Array.isArray(res) ? res : res?.data || [];
      setRecords(rows);
      if (res?.meta) {
        setMeta(res.meta);
      } else {
        // fallback if backend not yet updated
        setMeta({
          total: rows.length,
          totalPages: 1,
          page: pageNum,
          limit: limitNum,
        });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load salary history"
      );
    } finally {
      setLoading(false);
    }
  };

  // load when employee or page changes
  useEffect(() => {
    if (employee_id) {
      fetchHistory(employee_id, page, limit);
    }
  }, [employee_id, page, limit]);

  // apply frontend filters over current page
  const filtered = records.filter((rec) => {
    const matchStatus =
      statusFilter === "all" ? true : rec.status === statusFilter;
    const matchDate = dateFilter
      ? new Date(rec.cycle_start).toISOString().slice(0, 10) === dateFilter
      : true;
    return matchStatus && matchDate;
  });

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTxDate(tx) {
    const raw = tx?.action_date || tx?.created_at;
    if (!raw) return "—";
    const d = new Date(raw);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // mark a cycle as paid
  async function handleMarkPaid(cycle_key) {
    try {
      setSuccessMsg("");
      setError(null);
      setSavingKey(cycle_key);

      const res = await salaryAPI.MARKPAID({ employee_id, cycle_key });

      // update current page
      setRecords((prev) =>
        prev.map((r) =>
          r.cycle_key === cycle_key
            ? {
                ...r,
                status: "paid",
                paid_at: new Date().toISOString(),
              }
            : r
        )
      );

      setSuccessMsg(res?.message || "Marked as paid.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to mark as paid";
      setError(msg);
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <button
            onClick={() => router.push("/dashboard/salary")}
            className="text-xs text-gray-500 mb-2 hover:text-gray-700"
          >
            ← Back to salary list
          </button>
          <h2 className="text-lg font-semibold">
            Salary History — {employee_id}
          </h2>
          <p className="text-xs text-gray-500">
            Page {meta.page} of {meta.totalPages} • {meta.total} total records
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md mb-3">
          {error}
        </p>
      )}
      {successMsg && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md mb-3">
          {successMsg}
        </p>
      )}
      {loading && <p className="text-sm text-gray-500">Loading history…</p>}

      {/* Table */}
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-3 py-2 font-medium">Cycle</th>
              <th className="px-3 py-2 font-medium">Base Salary</th>
              <th className="px-3 py-2 font-medium">Payable</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Transactions</th>
              <th className="px-3 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                  No salary records for this employee.
                </td>
              </tr>
            ) : (
              filtered.map((rec) => (
                <tr key={rec._id}>
                  {/* Cycle */}
                  <td className="px-3 py-3 whitespace-nowrap text-gray-700">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatDate(rec.cycle_start)} →{" "}
                        {formatDate(rec.cycle_end)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {rec.cycle_key}
                      </span>
                    </div>
                  </td>

                  {/* Base salary */}
                  <td className="px-3 py-3 text-gray-700">
                    {rec.base_salary ?? "—"}
                  </td>

                  {/* Payable */}
                  <td className="px-3 py-3 text-gray-900 font-semibold">
                    {rec.payable_salary != null
                      ? Number(rec.payable_salary).toFixed(2)
                      : "—"}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md ${
                        SALARY_STATUS_COLORS[rec.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {rec.status}
                    </span>
                    {rec.paid_at && (
                      <div className="text-[11px] text-gray-400 mt-1">
                        Paid at: {formatDate(rec.paid_at)}
                      </div>
                    )}
                  </td>

                  {/* Transactions */}
                  {/* Transactions */}
                  <td className="px-3 py-3 text-gray-600">
                    {rec.transactions && rec.transactions.length > 0 ? (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600">
                          {rec.transactions.length} entr
                          {rec.transactions.length > 1 ? "ies" : "y"}
                        </summary>
                        <div className="mt-2 max-h-72 overflow-y-auto space-y-1 pr-1">
                          {[...rec.transactions] // clone so we don't mutate original
                            .sort((a, b) => {
                              const da = new Date(
                                a.action_date || a.created_at || 0
                              ).getTime();
                              const db = new Date(
                                b.action_date || b.created_at || 0
                              ).getTime();
                              return db - da; // DESC → newest first
                            })
                            .map((t, idx) => (
                              <div
                                key={idx}
                                className="rounded-md bg-gray-50 px-2 py-1 border border-gray-100"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-gray-700 capitalize">
                                    {t.type}
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {t.amount}
                                  </span>
                                </div>
                                <div className="text-[11px] text-gray-400">
                                  Date: {formatTxDate(t)}
                                </div>
                                {t.note ? (
                                  <div className="text-[11px] text-gray-500">
                                    {t.note}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                        </div>
                      </details>
                    ) : (
                      <span className="text-gray-400 text-xs">No changes</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-3 py-3">
                    {rec.status === "unpaid" ? (
                      <button
                        onClick={() => handleMarkPaid(rec.cycle_key)}
                        disabled={savingKey === rec.cycle_key}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium text-white ${
                          savingKey === rec.cycle_key
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gray-900 hover:bg-black"
                        }`}
                        title="Mark this cycle as paid"
                      >
                        {savingKey === rec.cycle_key
                          ? "Marking…"
                          : "Mark as Paid"}
                      </button>
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
            onClick={() => setPage((p) => (p < meta.totalPages ? p + 1 : p))}
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
