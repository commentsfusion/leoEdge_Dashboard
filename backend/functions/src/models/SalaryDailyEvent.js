import mongoose from "mongoose";

const SalaryDailyEventSchema = new mongoose.Schema(
  {
    employee_id: { type: String, required: true, index: true, trim: true },
    salary_date: { type: String, required: true, index: true, trim: true }, // "YYYY-MM-DD"

    // "increment" or "deduction"
    type: { type: String, enum: ["increment", "deduction"], required: true },

    // the delta applied (>= 0) on that call
    amount: { type: Number, required: true, min: 0 },

    // optional reason
    note: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

// common query index
SalaryDailyEventSchema.index({ employee_id: 1, salary_date: 1, createdAt: -1 });

export default mongoose.model("SalaryDailyEvent", SalaryDailyEventSchema);
