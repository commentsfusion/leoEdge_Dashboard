// app/(pages)/dashboard/employees/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { employeeAPI } from "../../../../Apis/employee.jsx";

// ✅ Import Icons
import { FiMail, FiPhone, FiClock, FiBriefcase, FiDollarSign } from "react-icons/fi";

const IMG_BASE =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "http://localhost:5000";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const res = await employeeAPI.GETEMPLYEEBYID(id);
        setEmployee(res?.data ? res.data : res);
      } catch (err) {
        setError(
          err?.response?.data?.error || err.message || "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">
          Loading employee details...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        ❌ {error}
      </div>
    );

  if (!employee)
    return (
      <div className="p-8 text-center text-gray-500">Employee not found.</div>
    );

  const joinDate = employee.joining_date
    ? new Date(employee.joining_date).toISOString().split("T")[0]
    : "—";

  const imgSrc =
    employee.image && employee.image !== ""
      ? employee.image.startsWith("http")
        ? employee.image
        : `${IMG_BASE}${employee.image.startsWith("/") ? "" : "/"}${employee.image}`
      : null;

  const isActive = employee.current_employee?.toLowerCase().includes("active");

  return (
    <div className="min-h-screen p-8">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            {employee?.name}
            <span className="text-gray-400 text-sm">
              ({employee?.employee_id})
            </span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {employee?.designation || "—"} · {employee?.job_shift || "—"} shift
          </p>
        </div>
        <span
          className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${
            isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {employee?.current_employee || "Status not set"}
        </span>
      </div>

      {/* MAIN CARD */}
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md shadow-xl border border-gray-100 rounded-3xl p-8">
        {/* AVATAR & BASIC INFO */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 pb-10 border-b border-gray-100">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={employee?.name}
                className="w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-blue-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {employee?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "NA"}
              </div>
            )}
            <div className="mt-5 space-y-2">
              <p className="text-gray-700 font-medium flex items-center gap-2">
                <FiMail className="text-blue-600" /> {employee.email || "No email"}
              </p>
              <p className="text-gray-700 font-medium flex items-center gap-2">
                <FiPhone className="text-green-600" /> {employee?.phone_no || "No phone"}
              </p>
            </div>
          </div>

          {/* EMPLOYEE DETAILS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <Info label="Employee ID" value={employee?.employee_id} />
            <Info label="Designation" value={employee?.designation} />
            <Info label="Job Shift" value={employee?.job_shift} />
            <Info label="Referred By" value={employee?.referred_by} />
            <Info label="Joining Date" value={joinDate} />
            <Info label="Created At" value={employee?.createdAt?.slice(0, 10)} />
            <Info label="Bank Account" value={employee?.bank_name} />
            <Info label="Account Title" value={employee?.account_title} />
            <Info label="IBAN/Account Number" value={employee?.iban_number} />
          
            <Info label="Updated At" value={employee?.updatedAt?.slice(0, 10)} />
          </div>
        </div>

        {/* SALARY SECTION */}
        <div className="rounded-2xl p-6 mt-8 ">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiDollarSign className="text-blue-600" /> Salary Overview
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Monthly Salary */}
            <div className="rounded-xl bg-white shadow-sm p-5 border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl shadow">
                <FiBriefcase />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
                  Monthly
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {employee.salary ? `Rs ${employee.salary}` : "—"}
                </p>
              </div>
            </div>

            {/* Per Hour */}
            <div className="rounded-xl bg-white shadow-sm p-5 border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xl shadow">
                <FiClock />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
                  Per Hour
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {employee.salary_per_hour
                    ? `Rs ${employee.salary_per_hour}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex flex-col bg-white/70 rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-800 mt-1">
        {value || "—"}
      </span>
    </div>
  );
}
