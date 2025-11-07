"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeAPI } from "../../../Apis/employee";
import toast, { Toaster } from "react-hot-toast";

const BONUS_TYPES = [
  { id: "attendance", label: "Attendance bonus" },
  { id: "extra_time", label: "Extra-time / OT bonus" },
  { id: "one_time", label: "One-time bonus" },
];

export default function Bonus() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("attendance");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data = [] } = await employeeAPI.GET();

      // normalize in case API returns {data: [...]}
      let employees = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

      // ✅ keep only active / on leave / probation
      const allowedStatuses = ["Active Employee", "On Leave", "Probation"];
      employees = employees.filter((emp) =>
        allowedStatuses.includes(emp.current_employee)
      );

      setRows(
        employees.map((emp) => ({
          _id: emp._id,
          employee_id: emp.employee_id,
          name: emp.name,
          designation: emp.designation,
          email: emp.email,
        }))
      );
    } catch (err) {
      setError(
        err?.response?.data?.error || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <section className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm space-y-5">
        {/* HEADER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
              🎁 Bonus Center
            </h3>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 border p-3">
            <p className="text-xs text-slate-500">Employees</p>
            <p className="text-sm font-semibold mt-1">{rows.length}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border p-3">
            <p className="text-xs text-slate-500">Quick tip</p>
            <p className="text-xs mt-1 text-slate-500">
              Click “Give bonus” to open employee-wise bonus form.
            </p>
          </div>
        </div>

        {/* ERRORS / LOADING */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
            {error}
          </p>
        )}
        {loading && (
          <p className="text-sm text-gray-500">Loading employees…</p>
        )}

        {/* TABLE */}
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white border-b z-10">
              <tr className="text-left text-gray-600">
                <th className="px-3 py-2 font-medium">Emp&nbsp;ID</th>
                <th className="px-3 py-2 font-medium">Employee</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!loading && rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    No employees found.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row._id || row.employee_id || idx}
                    className={idx % 2 ? "bg-gray-50/40" : ""}
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600">
                      {row.employee_id || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-900">
                        {row.name}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-gray-500">
                        {row.designation || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-gray-500">
                        {row.email || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/bonus_employee/${encodeURIComponent(
                              row.employee_id
                            )}`
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-md bg-slate-900 text-white px-3 py-1.5 text-xs hover:bg-slate-700 transition"
                      >
                        Give bonus
                        <span aria-hidden="true">→</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2">
          <div>Showing {rows.length} employees</div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border hover:bg-gray-50">
              Prev
            </button>
            <button className="px-3 py-1.5 rounded-lg border hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
