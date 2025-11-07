"use client";
import { useMemo, useState } from "react";
import { employeeAPI } from "../../../Apis/employee";
import { toast } from "react-hot-toast";

export default function EmployeeForm() {
  const HOURS_PER_MONTH = 180;

  const [form, setForm] = useState({
    imageFile: null,
    email: "",
    employeeId: "",
    name: "",
    joiningDate: "",
    salaryMonthly: "",
    designation: "",
    phoneNumber: "",
    shift: "morning",
    referredBy: "",
    // ✅ new fields
    ibanNumber: "",
    accountTitle: "",
    bankName: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setForm((s) => ({ ...s, imageFile: files?.[0] ?? null }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const salaryPerHour = useMemo(() => {
    const monthly = parseFloat(form.salaryMonthly);
    if (!monthly || monthly <= 0) return "";
    return (monthly / HOURS_PER_MONTH).toFixed(2);
  }, [form.salaryMonthly]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("employee_id", form.employeeId);
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("designation", form.designation);
      fd.append("phone_no", form.phoneNumber);
      fd.append("job_shift", form.shift);
      fd.append("salary", form.salaryMonthly);

      if (form.joiningDate) fd.append("joining_date", form.joiningDate);
      if (form.referredBy) fd.append("referred_by", form.referredBy);
      if (form.imageFile) fd.append("image", form.imageFile);

      // ✅ send optional bank fields using backend keys
      if (form.ibanNumber) fd.append("iban_number", form.ibanNumber);
      if (form.accountTitle) fd.append("account_title", form.accountTitle);
      if (form.bankName) fd.append("bank_name", form.bankName);

      const res = await employeeAPI.ADD(fd);

      toast.success(res?.message || "Employee created successfully!");

      // reset form
      setForm({
        imageFile: null,
        email: "",
        employeeId: "",
        name: "",
        joiningDate: "",
        salaryMonthly: "",
        designation: "",
        phoneNumber: "",
        shift: "morning",
        referredBy: "",
        ibanNumber: "",
        accountTitle: "",
        bankName: "",
      });
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create employee!";
      toast.error(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
      {/* heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add Employee</h1>
        <p className="text-sm text-gray-500">
          Fill details on the right. Profile is on the left.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6">
        {/* LEFT */}
        <aside className="md:sticky md:top-6">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold mb-4">Profile</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-28 w-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-1 ring-gray-200">
                {form.imageFile ? (
                  <img
                    src={URL.createObjectURL(form.imageFile)}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400">No image</span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Upload Image
              </label>
              <label
                htmlFor="imageFile"
                className="flex items-center justify-center h-10 rounded-md border border-dashed bg-gray-50 text-sm cursor-pointer hover:bg-gray-100 transition"
              >
                Click to choose file
              </label>
              <input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </div>

            {/* Email */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full rounded-md border px-3 py-2 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">
                Work email preferred.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <section className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold">
              Employment Details
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="employeeId">
                ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                placeholder="EMP-001"
                className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="joiningDate">
                Joining Date
              </label>
              <input
                id="joiningDate"
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="salaryMonthly">
                Salary (Monthly)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 text-sm bg-gray-50">
                  PKR
                </span>
                <input
                  id="salaryMonthly"
                  name="salaryMonthly"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salaryMonthly}
                  onChange={handleChange}
                  placeholder="60000"
                  className="w-full rounded-r-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Auto-calculates hourly below (based on {HOURS_PER_MONTH} hrs/mo).
              </p>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="designation">
                Job Role
              </label>
              <input
                id="designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="Frontend Developer"
                className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                inputMode="tel"
                placeholder="+92xxxxxxxxxx"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Shift */}
            <div className="md:col-span-2">
              <span className="block text-sm font-medium mb-1">Shift</span>
              <div className="inline-flex rounded-lg border p-1 bg-gray-50">
                {["morning", "evening", "night"].map((opt) => {
                  const active = form.shift === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm((s) => ({ ...s, shift: opt }))}
                      className={`px-3 py-1.5 text-sm rounded-md transition ${
                        active
                          ? "bg-white shadow border"
                          : "text-gray-600 hover:bg-white"
                      }`}
                    >
                      {opt[0].toUpperCase() + opt.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Referred By */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="referredBy">
                Referred By
              </label>
              <input
                id="referredBy"
                name="referredBy"
                value={form.referredBy}
                onChange={handleChange}
                placeholder="Referrer name"
                className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* salary per hour (readonly) */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="salaryPerHour">
                Salary per Hour (auto)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 text-sm bg-gray-50">
                  PKR/hr
                </span>
                <input
                  id="salaryPerHour"
                  value={salaryPerHour}
                  readOnly
                  className="w-full rounded-r-md border px-3 py-2 bg-gray-100 text-gray-700"
                  placeholder="—"
                />
              </div>
            </div>
          </div>

          {/* ✅ Bank Details */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3 text-gray-700">
              Bank Details (optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="accountTitle">
                  Account Title
                </label>
                <input
                  id="accountTitle"
                  name="accountTitle"
                  value={form.accountTitle}
                  onChange={handleChange}
                  placeholder="Employee account title"
                  className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="bankName">
                  Bank Name
                </label>
                <input
                  id="bankName"
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                  placeholder="Meezan, HBL, UBL..."
                  className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
                  <div>
                <label className="block text-sm font-medium mb-1" htmlFor="ibanNumber">
                  IBAN Number
                </label>
                <input
                  id="ibanNumber"
                  name="ibanNumber"
                  value={form.ibanNumber}
                  onChange={handleChange}
                  placeholder="PK00ABC..."
                  className="w-full rounded-md border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
              onClick={() =>
                setForm({
                  imageFile: null,
                  email: "",
                  employeeId: "",
                  name: "",
                  joiningDate: "",
                  salaryMonthly: "",
                  designation: "",
                  phoneNumber: "",
                  shift: "morning",
                  referredBy: "",
                  ibanNumber: "",
                  accountTitle: "",
                  bankName: "",
                })
              }
            >
              Reset
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}
