// components/UserProfileCard.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { employeeAPI } from "../Apis/employee";
import toast from "react-hot-toast";

const baseURL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

const STATUS_OPTIONS = [
  "Active Employee",
  "On Leave",
  "Probation",
  "Suspended",
  "Resigned",
  "Terminated",
];

const UserProfileCard = ({ loading, error, data }) => {
  // ✅ All hooks are always called, every render, in same order
  const router = useRouter();
  const [employees, setEmployees] = useState(Array.isArray(data) ? data : []);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (Array.isArray(data)) setEmployees(data);
  }, [data]);

  const getStatusText = (emp) =>
    emp?.current_employee || emp?.status || "Not defined";

  const filteredEmployees = useMemo(() => {
    if (statusFilter === "All") return employees;
    const target = statusFilter.trim().toLowerCase();
    return employees.filter(
      (emp) => getStatusText(emp)?.trim().toLowerCase() === target
    );
  }, [employees, statusFilter]);

  const handleEdit = (e, emp) => {
    e.preventDefault();
    e.stopPropagation();
    if (!emp?.employee_id) return;
    router.push(`/dashboard/employee_edit/${emp.employee_id}`);
  };

  const handleOpenDeletePopup = (e, emp) => {
    e.preventDefault();
    e.stopPropagation();
    setEmployeeToDelete(emp);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete?.employee_id) {
      toast.error("Employee ID not found.");
      return;
    }
    try {
      setDeleting(true);
      const res = await employeeAPI.POST(employeeToDelete.employee_id);
      toast.success(res?.message || "Employee deleted successfully.");
      setEmployees((prev) =>
        prev.filter((i) => i.employee_id !== employeeToDelete.employee_id)
      );
      setIsConfirmOpen(false);
      setEmployeeToDelete(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Error deleting employee."
      );
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setEmployeeToDelete(null);
  };

  // ✅ No early returns. Decide what to render via variables
  let content;

  if (loading) {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border bg-white p-5 shadow-sm animate-pulse space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  } else if (error) {
    content = <p className="text-red-600">{error}</p>;
  } else {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => {
          const initials = emp.name
            ? emp.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "NA";

          const statusText = getStatusText(emp);
          const isActive =
            statusText?.toLowerCase().includes("active") ||
            statusText === "Active";

          const imgSrc = emp.image
            ? emp.image.startsWith("http")
              ? emp.image
              : `${baseURL}${emp.image.startsWith("/") ? "" : "/"}${emp.image}`
            : null;

          return (
            <Link
              key={emp.employee_id}
              href={`/dashboard/employees/${emp.employee_id}`}
              className="relative group w-full rounded-2xl border bg-white shadow-sm p-5 hover:shadow-md transition cursor-pointer"
            >
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => handleEdit(e, emp)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full"
                  title="Edit employee"
                >
                  <FiEdit2 size={15} />
                </button>
                <button
                  onClick={(e) => handleOpenDeletePopup(e, emp)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full"
                  title="Delete employee"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>

              <div className="flex flex-col items-center gap-2">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={emp.name}
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-2xl font-semibold">
                    {initials}
                  </div>
                )}

                <div className="text-center mt-2 space-y-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {emp.name || emp.employee_id}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {emp.designation || "No designation"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {emp.email || "No email"}
                  </p>
                </div>

                <span
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
                    isActive
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />
                  {statusText}
                </span>
              </div>

              <div className="mt-5 space-y-2 bg-slate-50/60 rounded-xl p-3">
                <Row label="Employee ID" value={emp.employee_id || "—"} />
                <Row
                  label="Joining Date"
                  value={
                    emp.joining_date
                      ? new Date(emp.joining_date).toISOString().split("T")[0]
                      : "—"
                  }
                />
                <Row label="Referred by" value={emp.referred_by || "—"} small />
              </div>
            </Link>
          );
        })}

        {filteredEmployees.length === 0 && employees.length > 0 && (
          <p className="text-gray-500 col-span-3">
            No employees match the selected status.
          </p>
        )}

        {employees.length === 0 && (
          <p className="text-gray-500 col-span-3">No employees found.</p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Filter bar (renders every time; safe for hooks) */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold">
            {loading ? 0 : filteredEmployees.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold">{employees.length}</span> employees
        </div>

        <div className="sm:ml-auto flex items-center gap-2">
          <label htmlFor="statusFilter" className="text-sm text-gray-600">
            Filter by status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="All">All</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {content}

      {/* Confirm modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete employee?
            </h2>
            <p className="text-sm text-gray-600">
              This will permanently remove{" "}
              <span className="font-medium">
                {employeeToDelete?.name || employeeToDelete?.employee_id}
              </span>{" "}
              from the system.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function Row({ label, value, small = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xs font-medium text-gray-800 ${small ? "" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export default UserProfileCard;
