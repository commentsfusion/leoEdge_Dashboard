"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeAPI } from "../../../Apis/employee";
import toast, { Toaster } from "react-hot-toast";

export default function AttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [tabs, setTabs] = useState([]); // dynamically built from data
  const [activeTab, setActiveTab] = useState("Active Employee"); // ✅ default Active

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data = [] } = await employeeAPI.GET();

      // normalize in case API returns {data: [...]}
      const employees = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setAllEmployees(employees);

      // ✅ collect all unique current_employee values
      const uniqueStatuses = [
        ...new Set(employees.map((e) => e.current_employee || "Unknown")),
      ];

      // add "All" tab at the start
      const tabList = ["All", ...uniqueStatuses];
      setTabs(tabList);

      // ✅ Default = Active Employee, fallback to All if not found
      const defaultStatus = uniqueStatuses.includes("Active Employee")
        ? "Active Employee"
        : "All";

      setActiveTab(defaultStatus);

      const filtered =
        defaultStatus === "All"
          ? employees
          : employees.filter((e) => e.current_employee === defaultStatus);

      setRows(
        filtered.map((emp) => ({
          _id: emp._id,
          employee_id: emp.employee_id,
          name: emp.name,
          designation: emp.designation,
          email: emp.email,
          current_employee: emp.current_employee,
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    let filtered =
      tab === "All"
        ? allEmployees
        : allEmployees.filter((e) => e.current_employee === tab);

    setRows(
      filtered.map((emp) => ({
        _id: emp._id,
        employee_id: emp.employee_id,
        name: emp.name,
        designation: emp.designation,
        email: emp.email,
        current_employee: emp.current_employee,
      }))
    );
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <section className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h3 className="text-base md:text-lg font-semibold">Salary</h3>

          {/* ✅ Dynamic Tabs */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                  activeTab === tab
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Status messages */}
        {error && (
          <p className="mt-4 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
            {error}
          </p>
        )}
        {loading && (
          <p className="mt-4 text-sm text-gray-500">Loading employees…</p>
        )}

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white border-b z-10">
              <tr className="text-left text-gray-600">
                <th className="px-3 py-2 font-medium">Emp&nbsp;ID</th>
                <th className="px-3 py-2 font-medium">Employee</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!loading && rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-gray-400"
                  >
                    No employees found for this category.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row._id || row.employee_id || idx}
                    className={idx % 2 ? "bg-gray-50/40" : ""}
                    onClick={() =>
                      router.push(
                        `/dashboard/salary-history/${encodeURIComponent(
                          row.employee_id
                        )}`
                      )
                    }
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600">
                      {row.employee_id || "—"}
                    </td>
                    <td className="px-3 py-3 cursor-pointer">
                      <div className="font-medium text-gray-900 hover:text-gray-700">
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
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                        {row.current_employee || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {rows.length} of{" "}
            {activeTab === "All" ? allEmployees.length : rows.length} employees
          </div>
          <div className="flex items-center gap-2">
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
