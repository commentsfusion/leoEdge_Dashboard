"use client";
import React, { useState } from "react";
import { authAPI } from "../../Apis/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await authAPI.LOGIN({ email, password });
    if (!res?.success) throw new Error(res?.message || "Login failed");

    // normalize role
    const role = (res?.user?.role || "").toLowerCase();

    if (["admin", "employee"].includes(role)) {
      toast.success(res.message || "Logged in successfully.");
      router.replace("/dashboard"); // ✅ both admin & employee
    } else {
      toast.error("Access denied. Only admin or employee can proceed.");
    }
  } catch (err) {
    toast.error(err?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen grid place-items-center bg-black text-white">
      <div className="w-full max-w-sm bg-white/5 p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <form className="grid gap-4" onSubmit={handleLogin}>
          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="password" className="text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg bg-black border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 text-center bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-500 transition flex items-center justify-center disabled:opacity-60"
          >
            {loading ? (
              <div className="relative flex items-center justify-center">
                <span className="h-5 w-5 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="text-center text-sm mt-4">
          <a href="#" className="text-cyan-400 hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Page;
