"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { employeeAPI } from "../../../Apis/employee.jsx";
import { attendanceAPI } from "../../../Apis/attendance.jsx";
import { salaryAPI } from "../../../Apis/salary.jsx";
import toast, { Toaster } from "react-hot-toast";

const baseSelect =
  "w-full md:w-40 rounded-md border px-2.5 py-2 bg-white focus:outline-none";

const STATUS_STYLES = {
  Present: "bg-green-100 text-green-800 ring-1 ring-green-200",
  Absent: "bg-red-100 text-red-800 ring-1 ring-red-200",
  Late: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200",
  NONS: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  LEAVE: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  Earlyleave: "bg-purple-100 text-purple-800 ring-1 ring-purple-200",
};

export default function AttendancePage() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  // ✅ FETCH DATA
  const fetchData = useCallback(async (dateStr) => {
    if (!dateStr) return;
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Get all employees
      const { data: employeesRes = [] } = await employeeAPI.GET();

      // 🔎 Normalize employees (API may return {data: [...]})
      let employees = Array.isArray(employeesRes)
        ? employeesRes
        : Array.isArray(employeesRes?.data)
        ? employeesRes.data
        : [];

      // ✅ FILTER ONLY NEEDED STATUSES
      const allowedStatuses = ["Active Employee", "On Leave", "Probation"];
      employees = employees.filter((emp) =>
        allowedStatuses.includes(emp.current_employee)
      );

      // 2️⃣ Get attendance for this date
      let dayAttendanceRes = [];
      try {
        const res = await attendanceAPI.GET_BY_DATE(dateStr);
        dayAttendanceRes = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];
      } catch (err) {
        console.warn("GET_BY_DATE failed:", err?.message);
        dayAttendanceRes = [];
      }

      // ✅ Make map for quick lookup
      const attendanceMap = Array.isArray(dayAttendanceRes)
        ? dayAttendanceRes.reduce((acc, att) => {
            acc[att.employee_id] = att;
            return acc;
          }, {})
        : {};

      // 3️⃣ Combine employee list + attendance
      setRows(
        employees.map((emp) => {
          const att = attendanceMap[emp.employee_id];
          if (att) {
            return {
              _id: emp._id,
              employee_id: emp.employee_id,
              name: emp.name,
              designation: emp.designation,
              status: att.status,
              lateDetail: att.comment || "",
              note: att.extra_note || att.note || "",
              _hasTodayAttendance: true,
            };
          }
          return {
            _id: emp._id,
            employee_id: emp.employee_id,
            name: emp.name,
            designation: emp.designation,
            status: "Present",
            lateDetail: "",
            note: "",
            _hasTodayAttendance: false,
          };
        })
      );
    } catch (err) {
      setError(
        err?.response?.data?.error || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // 🧭 Fetch when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchData(selectedDate);
    } else {
      setRows([]);
      setError(null);
    }
  }, [selectedDate, fetchData]);

  const updateRow = (i, patch) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    );

  const buildSalaryPayload = ({
    status,
    lateDetail,
    employee_id,
    action_date,
    early_hours,
  }) => {
    // Present or Leave → no salary change
    if (status === "Present" || status === "LEAVE") return null;

    if (status === "Late" && lateDetail === "less_15") {
      return {
        employee_id,
        note: "Deduction of 500 Rs because you were late less than 15 minutes.",
        decrement: 500,
        action_date,
      };
    }

    if (status === "Late" && lateDetail === "more_15") {
      return {
        employee_id,
        note: "Deduction of 800 Rs because you were late more than 15 minutes.",
        decrement: 800,
        action_date,
      };
    }

    if (status === "Absent") {
      return {
        employee_id,
        note: "A day salary has been deducted (Absent).",
        absent_amount: 9,
        action_date,
      };
    }

    if (status === "NONS") {
      return {
        employee_id,
        note: "A day salary has been deducted (NONS).",
        absent_amount: 18,
        action_date,
      };
    }

    if (status === "Earlyleave" && early_hours) {
      return {
        employee_id,
        note: `You left ${early_hours} hour(s) early from the office.`,
        early_hour: early_hours,
        action_date,
      };
    }

    return null;
  };

  const handleSave = async (row) => {
    if (!selectedDate) {
      toast.error("Please select a date first.");
      return;
    }

    if (row.status === "Late" && !row.lateDetail) {
      toast.error("Please select how much late (less or more than 15 min).");
      return;
    }

    const autoNote =
      row.status === "Late"
        ? row.lateDetail === "less_15"
          ? "Late: less than 15 min"
          : "Late: more than 15 min"
        : "";
    const extraNote = row.note || "";

    try {
      setSavingId(row.employee_id);
      const attendanceDate = selectedDate;

      // 1️⃣ Save attendance
      const res = await attendanceAPI.CREATE({
        employee_id: row.employee_id,
        attendance_date: attendanceDate,
        status: row.status,
        note: autoNote,
        extra_note: extraNote,
        comment: row.lateDetail,
        early_hours: row.early_hours || undefined,
        changed_by: "Admin",
      });

      toast.success(res?.message || `Attendance saved for ${row.employee_id}`);

      // 2️⃣ Salary adjustment if needed
      const salaryPayload = buildSalaryPayload({
        status: row.status,
        lateDetail: row.lateDetail,
        employee_id: row.employee_id,
        action_date: attendanceDate,
        early_hours: row.early_hours,
      });

      if (salaryPayload) {
        await salaryAPI.APPLY(salaryPayload);
        toast.success("Salary adjustment applied.");
      }

      // 3️⃣ Update UI
      setRows((prev) =>
        prev.map((r) =>
          r.employee_id === row.employee_id
            ? {
                ...r,
                status: row.status,
                lateDetail: row.lateDetail,
                note: extraNote || autoNote || "",
                _hasTodayAttendance: true,
              }
            : r
        )
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save attendance";
      toast.error(msg);
      console.error("attendance/salary error ❌", err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <section className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-base md:text-lg font-semibold">Attendance</h3>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600" htmlFor="att-date">
              Date:
            </label>
            <input
              id="att-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border px-2 py-1 text-sm"
            />
            <button
              onClick={() => selectedDate && fetchData(selectedDate)}
              className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:bg-black"
            >
              Load
            </button>
          </div>
        </div>

        {!selectedDate && (
          <p className="mt-4 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
            Please select a date to load attendance.
          </p>
        )}

        {error && selectedDate && (
          <p className="mt-4 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        {loading && selectedDate && (
          <p className="mt-4 text-sm text-gray-500">Loading employees…</p>
        )}

        {selectedDate && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white border-b z-10">
                <tr className="text-left text-gray-600">
                  <th className="px-3 py-2 font-medium">Emp ID</th>
                  <th className="px-3 py-2 font-medium">Employee</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Change</th>
                  <th className="px-3 py-2 font-medium">Note</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-gray-400"
                    >
                      No employees found for this date.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={row._id || row.employee_id || idx}>
                      <td className="px-3 py-3 text-gray-600">
                        {row.employee_id}
                      </td>

                      <td
                        onClick={() =>
                          router.push(
                            `/dashboard/attendances/${encodeURIComponent(
                              row.employee_id
                            )}`
                          )
                        }
                        className="px-3 py-3 cursor-pointer transition hover:bg-gray-50"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-gray-900">
                            {row.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {row.designation || "No designation"}
                          </span>
                          <span className="text-[11px] text-blue-500 inline-flex items-center gap-1">
                            View history
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M9 5l7 7-7 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md ${
                            STATUS_STYLES[row.status] || ""
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-2">
                          <select
                            className={`${baseSelect} focus:ring-green-300`}
                            value={row.status}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateRow(idx, {
                                status: val,
                                lateDetail:
                                  val === "Late" ? row.lateDetail : "",
                                early_hours:
                                  val === "Earlyleave" ? row.early_hours : "",
                              });
                            }}
                            disabled={loading}
                          >
                            <option value="Present">Present</option>
                            <option value="Late">Late</option>
                            <option value="Absent">Absent</option>
                            <option value="NONS">NCNO</option>
                            <option value="Earlyleave">Early Leave</option>
                            <option value="LEAVE">Annual Leave</option>
                          </select>

                          {row.status === "Late" && (
                            <select
                              className={`${baseSelect} bg-yellow-50 focus:ring-yellow-300`}
                              value={row.lateDetail}
                              onChange={(e) =>
                                updateRow(idx, { lateDetail: e.target.value })
                              }
                            >
                              <option value="">Select delay…</option>
                              <option value="less_15">Less than 15 min</option>
                              <option value="more_15">More than 15 min</option>
                            </select>
                          )}

                          {row.status === "Earlyleave" && (
                            <input
                              type="number"
                              placeholder="Early hours (e.g. 3)"
                              value={row.early_hours || ""}
                              onChange={(e) =>
                                updateRow(idx, {
                                  early_hours: Number(e.target.value),
                                })
                              }
                              className={`${baseSelect} bg-purple-50 focus:ring-purple-300`}
                            />
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <input
                          value={row.note}
                          onChange={(e) =>
                            updateRow(idx, { note: e.target.value })
                          }
                          placeholder="Optional note…"
                          className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleSave(row)}
                          disabled={savingId === row.employee_id}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white transition ${
                            savingId === row.employee_id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gray-900 hover:bg-black"
                          }`}
                        >
                          {savingId === row.employee_id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
