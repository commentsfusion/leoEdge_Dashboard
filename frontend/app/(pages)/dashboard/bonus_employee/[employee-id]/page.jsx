"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { salaryAPI } from "../../../../Apis/salary"; // adjust path if needed

// only 2 types now
const bonusTypes = [
  {
    id: "extra_time",
    label: "Extra-Hour Bonus",
    desc: "Pay for extra hours — percentage or fixed.",
  },
  {
    id: "random",
    label: "Random Bonus / Deduction",
    desc: "One-time bonus OR salary cut with note.",
  },
];

export default function EmployeeBonusPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const employeeId =
    params?.employee_id ||
    params?.id ||
    params?.["employee-id"] ||
    searchParams.get("employee_id") ||
    "";

  const typeFromUrl = searchParams.get("type");

  // default to extra_time now
  const [activeBonus, setActiveBonus] = useState("extra_time");
  const [extraMode, setExtraMode] = useState("percentage");
  const [randomMode, setRandomMode] = useState("bonus");
  const [isSaving, setIsSaving] = useState(false);

  // dates (only 2 now)
  const [extraDate, setExtraDate] = useState("");
  const [randomDate, setRandomDate] = useState("");

  // extra-time states
  const [extraHours, setExtraHours] = useState("");
  const [extraPercent, setExtraPercent] = useState("");
  const [extraAmount, setExtraAmount] = useState("");
  const [extraNote, setExtraNote] = useState("");

  // random states
  const [randomAmount, setRandomAmount] = useState("");
  const [randomNote, setRandomNote] = useState("");
  const [randomDeductionAmount, setRandomDeductionAmount] = useState("");
  const [randomDeductionNote, setRandomDeductionNote] = useState("");

  // preselect from ?type=...
  useEffect(() => {
    if (typeFromUrl === "extra_time" || typeFromUrl === "random") {
      setActiveBonus(typeFromUrl);
    }
  }, [typeFromUrl]);

  // enable/disable
  const canSaveExtra =
    activeBonus === "extra_time" &&
    extraDate.trim() !== "" &&
    extraNote.trim() !== "" &&
    ((extraMode === "percentage" &&
      extraHours.trim() !== "" &&
      extraPercent.trim() !== "") ||
      (extraMode === "amount" && extraAmount.trim() !== ""));

  const canSaveRandom =
    activeBonus === "random" &&
    randomDate.trim() !== "" &&
    ((randomMode === "bonus" &&
      randomAmount.trim() !== "" &&
      randomNote.trim() !== "") ||
      (randomMode === "deduction" &&
        randomDeductionAmount.trim() !== "" &&
        randomDeductionNote.trim() !== ""));

  // MAIN SAVE
  const handleSave = async () => {
    if (!employeeId) {
      toast.error("Employee ID is missing from URL.");
      return;
    }

    let payload = {
      employee_id: employeeId,
    };

    // 1) Extra time
    if (activeBonus === "extra_time") {
      if (extraMode === "percentage") {
        const percent = Number(extraPercent);
        const hours = Number(extraHours);
        payload.bonus_percentage = percent;
        payload.extra_hour = hours;
        payload.note = extraNote;
      } else {
        payload.bonus_amount = Number(extraAmount);
        payload.note = extraNote;
      }
      // 👇 this is the one your backend now expects
      payload.action_date = extraDate;
    }

    // 2) Random
    if (activeBonus === "random") {
      if (randomMode === "bonus") {
        payload.bonus_amount = Number(randomAmount);
        payload.note = randomNote;
      } else {
        payload.decrement = Number(randomDeductionAmount);
        payload.note = randomDeductionNote;
      }
      // 👇 pass date as action_date
      payload.action_date = randomDate;
    }

    console.log("➡️ sending payload to /salary/apply", payload);

    try {
      setIsSaving(true);
      const res = await salaryAPI.APPLY(payload);
      toast.success(res?.message || "Salary adjustment saved ✅");
      // optional: reset fields for nicer UX
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error occurred while saving bonus.";
      toast.error(msg);
      console.error("Error occurred while saving bonus", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <section className="space-y-6">
        {/* heading */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              Add Salary Adjustment
            </h1>
            <p className="text-sm text-gray-500">
              Select a type and fill the required fields. Note is compulsory.
            </p>
            {employeeId ? (
              <p className="text-xs text-gray-400 mt-1">
                For employee: <span className="font-mono">{employeeId}</span>
              </p>
            ) : (
              <p className="text-xs text-red-400 mt-1">
                Employee ID not found in URL.
              </p>
            )}
          </div>
        </div>

        {/* bonus type cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bonusTypes.map((item) => {
            const isActive = activeBonus === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveBonus(item.id)}
                className={`text-left rounded-2xl border p-4 transition hover:shadow-sm ${
                  isActive
                    ? "border-gray-900 bg-gray-900/5"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p
                  className={`font-semibold ${
                    isActive ? "text-gray-900" : "text-gray-800"
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                {isActive && (
                  <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-gray-900">
                    Selected
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* main card */}
        <div className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm space-y-5">
          {/* EXTRA-TIME */}
          {activeBonus === "extra_time" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Extra-Hour Bonus
                  </h2>
                  <p className="text-xs text-gray-500">
                    Pay for extra hours either in percentage or in fixed amount.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Action Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={extraDate}
                    onChange={(e) => setExtraDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>
              </div>

              {/* show rest only if date selected */}
              {extraDate && (
                <>
                  {/* mode toggle */}
                  <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setExtraMode("percentage");
                        setExtraAmount("");
                      }}
                      className={`px-3 py-1 rounded-full ${
                        extraMode === "percentage"
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      Percentage
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExtraMode("amount");
                        setExtraHours("");
                        setExtraPercent("");
                      }}
                      className={`px-3 py-1 rounded-full ${
                        extraMode === "amount"
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      Amount
                    </button>
                  </div>

                  {extraMode === "percentage" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Extra Hours <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={extraHours}
                          onChange={(e) => setExtraHours(e.target.value)}
                          placeholder="e.g. 4"
                          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Percentage (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={extraPercent}
                          onChange={(e) => setExtraPercent(e.target.value)}
                          placeholder="e.g. 15"
                          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Note / Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={extraNote}
                          onChange={(e) => setExtraNote(e.target.value)}
                          rows={2}
                          placeholder="e.g. Stayed after shift for client handover"
                          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Amount (PKR) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={extraAmount}
                          onChange={(e) => setExtraAmount(e.target.value)}
                          placeholder="e.g. 800"
                          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Note / Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={extraNote}
                          onChange={(e) => setExtraNote(e.target.value)}
                          rows={2}
                          placeholder="e.g. Helped complete month-end reports"
                          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!canSaveExtra || isSaving}
                      className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${
                        !canSaveExtra || isSaving
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-gray-900 hover:bg-black"
                      }`}
                    >
                      {isSaving ? "Saving..." : "Save Extra-Time Bonus"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* RANDOM */}
          {activeBonus === "random" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Random / One-Time
                  </h2>
                  <p className="text-xs text-gray-500">
                    Choose bonus to add money or deduction to reduce salary.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Action Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={randomDate}
                    onChange={(e) => setRandomDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>
              </div>

              {/* show rest only if date selected */}
              {randomDate && (
                <>
                  {/* mini tabs */}
                  <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setRandomMode("bonus")}
                      className={`px-3 py-1 rounded-full ${
                        randomMode === "bonus"
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      Bonus
                    </button>
                    <button
                      type="button"
                      onClick={() => setRandomMode("deduction")}
                      className={`px-3 py-1 rounded-full ${
                        randomMode === "deduction"
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      Deduction
                    </button>
                  </div>

                  {randomMode === "bonus" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Amount (PKR) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={randomAmount}
                          onChange={(e) => setRandomAmount(e.target.value)}
                          placeholder="e.g. 2500"
                          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Note / Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={randomNote}
                          onChange={(e) => setRandomNote(e.target.value)}
                          rows={2}
                          placeholder="e.g. Festival bonus / helped in salon on weekend"
                          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Deduction Amount (PKR){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={randomDeductionAmount}
                          onChange={(e) =>
                            setRandomDeductionAmount(e.target.value)
                          }
                          placeholder="e.g. 500"
                          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Deduction Note{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={randomDeductionNote}
                          onChange={(e) =>
                            setRandomDeductionNote(e.target.value)
                          }
                          rows={2}
                          placeholder="e.g. Late mark penalty / damaged product"
                          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!canSaveRandom || isSaving}
                      className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${
                        !canSaveRandom || isSaving
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-gray-900 hover:bg-black"
                      }`}
                    >
                      {isSaving
                        ? "Saving..."
                        : randomMode === "bonus"
                        ? "Save Random Bonus"
                        : "Save Deduction"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
