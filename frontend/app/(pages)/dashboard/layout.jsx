"use client";
import Sidebar from "../../components/sidebar";
import RequireAuth from "./RequireAuth";

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth>
      <div className="bg-white text-black md:pl-64">
        <Sidebar />
        <main className="h-screen overflow-y-auto p-6">{children}</main>
      </div>
    </RequireAuth>
  );
}
