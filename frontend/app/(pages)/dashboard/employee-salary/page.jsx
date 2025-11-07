// app/dashboard/salary/[employeeId]/page.jsx  (you can also place at app/dashboard/employee-salary/page.jsx)
"use client";

import { useState } from "react";
import Link from "next/link";

// ---- DEMO (hard-coded) ----
const DEMO = [
  {
    _id: "1",
    employeeId: "EMP-001",
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    designation: "Frontend Developer",
    salary: 120000,
  },
  {
    _id: "2",
    employeeId: "EMP-002",
    name: "Bilal Ahmed",
    email: "bilal@example.com",
    designation: "Backend Developer",
    salary: 140000,
  },
  {
    _id: "3",
    employeeId: "EMP-003",
    name: "Sara Malik",
    email: "sara@example.com",
    designation: "UI/UX Designer",
    salary: 110000,
  },
];

const PKR = (n) =>
  Number(n || 0).toLocaleString("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  });

export default function EmployeeSalaryPage() {
  // 👇 hard-coded selection (no params)
  const emp = DEMO[0];

  // editable UI-only fields
  const [deduction, setDeduction] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [comments, setComments] = useState("");
  const [saved, setSaved] = useState(false);

  const payable = Math.max(0, emp.salary - Number(deduction || 0) + Number(bonus || 0));

  const onSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
    // UI-only: later POST { employeeId: emp.employeeId, salary: emp.salary, deduction, bonus, comments, payable }
  };

  return (
    <section className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/salary" className="text-sm text-gray-600 hover:underline">
            ← Back to Salary
          </Link>
          <h3 className="text-base md:text-lg font-semibold">
            Salary & Payable — {emp.employeeId}
          </h3>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
          title="UI only — wire to backend later"
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      {/* Identity (fixed) */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ReadOnly label="Name" value={emp.name} />
        <ReadOnly label="Email" value={emp.email} />
        <ReadOnly label="Employee ID" value={emp.employeeId} />
        <ReadOnly label="Designation" value={emp.designation} />
        <ReadOnly label="Salary (Fixed)" value={PKR(emp.salary)} />
      </div>

      {/* Editable */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NumberInput
          label="Deduction"
          value={deduction}
          min={0}
          onChange={setDeduction}
          hint="PKR to deduct this period"
        />
        <NumberInput
          label="Bonus"
          value={bonus}
          min={0}
          onChange={setBonus}
          hint="PKR to add this period"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Comments</label>
          <input
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Optional note…"
            className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Base Salary" value={PKR(emp.salary)} />
        <Stat label="Deduction" value={PKR(Number(deduction || 0))} />
        <Stat label="Bonus" value={PKR(Number(bonus || 0))} />
        <Stat label="Payable" value={PKR(payable)} emphasize />
      </div>
    </section>
  );
}

/* ---------- tiny presentational helpers ---------- */
function ReadOnly({ label, value }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-medium break-all">{value}</div>
    </div>
  );
}

function Stat({ label, value, emphasize }) {
  return (
    <div className={`rounded-xl border p-3 ${emphasize ? "bg-gray-50" : ""}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 ${emphasize ? "text-xl font-semibold" : "text-lg font-semibold"}`}>
        {value}
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, min = 0, step = 1, hint }) {
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(min, n) : 0;
  };
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange?.(toNum(e.target.value))}
        placeholder="0"
        className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 text-right"
      />
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}
