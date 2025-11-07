import mongoose from "mongoose";

const SalaryDailySchema = new mongoose.Schema(
  {
    employee_id: { type: String, required: true, index: true, trim: true },

    // snapshot of Employee.salary on this date
    base_salary: { type: Number, required: true },

    // user-provided adjustments (>= 0), cumulative for the day
    increment: { type: Number, default: 0, min: 0 },
    deduction: { type: Number, default: 0, min: 0 },

    // computed: base_salary - deduction + increment (min 0)
    payable_amount: { type: Number, required: true, min: 0 },

    // required daily key: YYYY-MM-DD
    salary_date: { type: String, required: true, trim: true, index: true },

    // optional note / reason (you may append in controller)
    note: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

// enforce 1 record per employee per date
SalaryDailySchema.index({ employee_id: 1, salary_date: 1 }, { unique: true });

export default mongoose.model("SalaryDaily", SalaryDailySchema);
