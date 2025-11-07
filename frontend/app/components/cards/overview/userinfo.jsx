"use client";

import { statsData } from "../../../text/statsData"; // keep your path

export default function StatsCard({ loading, error, data }) {

  if (loading)
    return (
      <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border bg-white p-4 md:p-5 animate-pulse"
          >
            <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );

  if (error)
    return (
      <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
        {error}
      </p>
    );

  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
      {statsData.map((card, index) => {
        // map your API data to cards
        let value = "-";

        if (index === 0) {
          // total employees
          value = data?.total ?? 0;
        } else if (index === 1) {
          // active employees
          value = data?.active ?? 0;
        } else if (index === 2) {
          // maybe unpaid salaries?
          // value = data?.raw?.ex-employee?? 0;
        } 

        return (
          <div
            key={index}
            className="rounded-2xl border bg-white p-4 md:p-5 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-700">
                {card.title}
              </h3>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-lg ${card.color}`}
              >
                {card.icon}
              </span>
            </div>

            <div>
              <p className="text-3xl font-bold text-gray-900 leading-tight">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {card.subtitle ? (
                <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
