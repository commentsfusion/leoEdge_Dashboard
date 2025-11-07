// app/(pages)/dashboard/employees/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { employeeAPI } from "../../../../Apis/employee.jsx";
import {
  FiMail,
  FiPhone,
  FiClock,
  FiBriefcase,
  FiDollarSign,
  FiCamera,
  FiUpload,
} from "react-icons/fi";
import toast from "react-hot-toast";

const IMG_BASE =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "http://localhost:5000";

export default function EmployeeEditPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Fetch by id
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await employeeAPI.GETEMPLYEEBYID(id);
        const emp = res?.data ? res.data : res;
        setEmployee(emp);
        // seed editable state
        setForm({
          name: emp.name || "",
          email: emp.email || "",
          phone_no: emp.phone_no || "",
          designation: emp.designation || "",
          job_shift: emp.job_shift || "",
          current_employee: emp.current_employee || "",
          salary: emp.salary ?? "",
          salary_per_hour: emp.salary_per_hour ?? "",
          referred_by: emp.referred_by || "",
          joining_date: emp.joining_date ? emp.joining_date.slice(0, 10) : "",
          image: emp.image || "",
        });
      } catch (err) {
        setError(
          err?.response?.data?.error || err.message || "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Form helpers
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setNotice("");
  };

  // Handle image file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const uploadResponse = await employeeAPI.UPLOADEMPLOYEEIMAGE(
        id,
        formData
      );
      const img =
        uploadResponse?.data?.image ||
        uploadResponse?.data?.imageUrl ||
        uploadResponse?.image ||
        uploadResponse?.imageUrl;

      if (img) {
        setForm((f) => ({ ...f, image: img }));
        toast.success(" Image uploaded successfully!");
      } else {
        toast.error("Uploaded but no image path returned");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.error || err.message || "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setForm((f) => ({ ...f, image: "" }));
    setNotice("Image removed");
  };

  useEffect(() => {
    if (!form) return;

    if (form.salary && !isNaN(Number(form.salary))) {
      const MONTH_DAYS = 5 * 4; // 5 days/week * 4 weeks = 20
      const HOURS_PER_DAY = 9; // 9 hours/day
      const totalHours = MONTH_DAYS * HOURS_PER_DAY; // 20 * 9 = 180

      const perHour = Number(form.salary) / totalHours;

      setForm((f) => ({
        ...f,
        salary_per_hour: Number(perHour.toFixed(2)),
      }));
    }
  }, [form?.salary]);

  const handleSave = async () => {
    if (!form) return;

    try {
      setSaving(true);

      const payload = {
        name: form.name,
        email: form.email,
        phone_no: form.phone_no,
        designation: form.designation,
        job_shift: form.job_shift,
        current_employee: form.current_employee,
        salary: form.salary === "" ? null : Number(form.salary),
        salary_per_hour:
          form.salary_per_hour === "" ? null : Number(form.salary_per_hour),
        referred_by: form.referred_by,
        joining_date: form.joining_date
          ? new Date(form.joining_date).toISOString()
          : null,
        image: form.image,
      };

      const res = await employeeAPI.UPDATEEMPLOYEE(id, payload);
      const updated = res?.data ? res.data : res;

      setEmployee(updated);
      setForm({
        ...updated,
        joining_date: updated.joining_date
          ? updated.joining_date.slice(0, 10)
          : "",
      });

      // ✅ Only show backend message in toast
      toast.success(res?.message || "Employee updated successfully!");
    } catch (err) {
      toast.error(
        err?.response?.data?.error || err.message || "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!employee) return;
    setForm({
      name: employee.name || "",
      email: employee.email || "",
      phone_no: employee.phone_no || "",
      designation: employee.designation || "",
      job_shift: employee.job_shift || "",
      current_employee: employee.current_employee || "",
      salary: employee.salary ?? "",
      salary_per_hour: employee.salary_per_hour ?? "",
      referred_by: employee.referred_by || "",
      joining_date: employee.joining_date
        ? employee.joining_date.slice(0, 10)
        : "",
      image: employee.image || "",
    });
    setNotice("");
    setError("");
  };

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

  if (!employee || !form)
    return (
      <div className="p-8 text-center text-gray-500">Employee not found.</div>
    );

  const imgSrc =
    form.image && form.image !== ""
      ? form.image.startsWith("http")
        ? form.image
        : `${IMG_BASE}${form.image.startsWith("/") ? "" : "/"}${form.image}`
      : null;

  const isActive = (form.current_employee || "")
    .toLowerCase()
    .includes("active");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="text-blue-600">{form.name}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Update employee details below. Fields auto-calculate where
              applicable.
            </p>
          </div>
          <span
            className={`px-4 py-1 rounded-full text-sm font-semibold ${
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {form.current_employee || "Status not set"}
          </span>
        </div>

        {/* FORM SECTIONS */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT SIDE: Profile + Contact */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
              <FiBriefcase className="text-blue-600" /> Profile
            </h2>

            {/* Image Upload Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    className="w-28 h-28 rounded-full object-cover shadow-lg ring-4 ring-blue-100"
                    alt={form.name}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-bold text-3xl">
                    {form.name?.slice(0, 2)?.toUpperCase() || "NA"}
                  </div>
                )}

                {/* Camera Icon Overlay */}
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <FiCamera className="w-4 h-4" />
                </label>
              </div>

              {/* File Input (hidden) */}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Upload Controls */}
              <div className="flex flex-col items-center space-y-2">
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <FiUpload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Change Photo"}
                </label>

                {imgSrc && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove Photo
                  </button>
                )}

                <p className="text-xs text-gray-500 text-center max-w-xs">
                  JPG, PNG or WebP. Max 5MB.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <InputField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={onChange}
              />
              <InputField
                label="Email"
                name="email"
                value={form.email}
                onChange={onChange}
                icon={<FiMail />}
              />
              <InputField
                label="Phone"
                name="phone_no"
                value={form.phone_no}
                onChange={onChange}
                icon={<FiPhone />}
              />
            </div>
          </div>

          {/* RIGHT SIDE: Job + Salary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
              <FiClock className="text-blue-600" /> Job Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Job Shift"
                name="job_shift"
                value={form.job_shift}
                onChange={onChange}
                options={["morning", "evening", "night"]}
              />
              <SelectField
                label="Status"
                name="current_employee"
                value={form.current_employee}
                onChange={onChange}
                options={[
                  "Active Employee",
                  "On Leave",
                  "Probation",
                  "Suspended",
                  "Resigned",
                  "Terminated",
                ]}
              />

              <InputField
                label="Designation"
                name="designation"
                value={form.designation}
                onChange={onChange}
              />
              <InputField
                label="Referred By"
                name="referred_by"
                value={form.referred_by}
                onChange={onChange}
              />
              <InputField
                label="Joining Date"
                type="date"
                name="joining_date"
                value={form.joining_date}
                onChange={onChange}
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 border-t pt-4 flex items-center gap-2">
              <FiDollarSign className="text-green-600" /> Salary Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Monthly Salary (Rs)"
                name="salary"
                value={form.salary}
                onChange={onChange}
                type="number"
              />
              <InputField
                label="Per Hour (Rs)"
                name="salary_per_hour"
                value={form.salary_per_hour}
                onChange={onChange}
                type="number"
              />
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 shadow-sm"
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small building blocks */

function InputField({ label, name, value, onChange, type = "text", icon }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition">
        {icon && <span className="px-2 text-gray-500">{icon}</span>}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 text-sm bg-transparent outline-none rounded-lg"
        />
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options = [] }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
