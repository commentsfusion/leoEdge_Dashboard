"use client";

import { useCallback, useEffect, useState } from "react";
import UserProfileCard from "@/app/components/userprofilecard.jsx";
import Userinfo from "../../../components/cards/overview/userinfo.jsx";
import { employeeAPI } from "../../../Apis/employee.jsx";

const Overview = () => {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeAPI.GET();
      setResp(response);
    } catch (err) {
      console.error("API Error:", err);
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

  // 👇 normalize employees so all children get clean data
  const employees = Array.isArray(resp?.data) ? resp.data : [];

  // derive counts here, don’t keep separate states
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) =>
    (e.current_employee || "").toLowerCase().includes("active")
  ).length;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="mt-4">
        <h1 className="font-bold text-2xl sm:text-2xl">
          Employee Dashboard Overview
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Quick glance at your workforce, status, and employee records.
        </p>
      </div>

      {/* STATS / OVERVIEW CARDS */}
      <div>
        <Userinfo
          loading={loading}
          error={error}
          data={{
            total: totalEmployees,
            active: activeEmployees,
            raw: resp,
          }}
          totalEmployees={totalEmployees}
          activeEmployees={activeEmployees}
        />
      </div>

      {/* SECTION TITLE */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-gray-900">
          Employee Profiles
        </h2>
        <p className="text-xs text-gray-400">
          Showing {totalEmployees} employee{totalEmployees === 1 ? "" : "s"}
        </p>
      </div>

      {/* EMPLOYEE CARDS */}
      <UserProfileCard
        loading={loading}
        error={error}
        data={employees}
      />
    </div>
  );
};

export default Overview;
