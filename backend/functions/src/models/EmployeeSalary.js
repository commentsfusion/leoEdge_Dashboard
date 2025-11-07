// models/EmployeeSalary.js
import mongoose from "mongoose";

const SalaryTxnSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "increment",
        "decrement",
        "bonus_amount",
        "bonus_percentage",
        "attendance_bonus",
        "overtime",
        "absent",
        "early_leave",          // we added this earlier
        "attendance_bonus_auto" // 👈 NEW: auto 5000
      ],
    },
    amount: { type: Number, required: true },
    meta: { type: Object, default: {} },
    note: { type: String, default: "" },
    action_date: { type: Date, required: true, default: Date.now },
    created_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EmployeeSalarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employee_id: { type: String, required: true, index: true, trim: true },

    cycle_key: { type: String, required: true, index: true },
    cycle_start: { type: Date, required: true },
    cycle_end: { type: Date, required: true },

    base_salary: { type: Number, required: true },
    salary_per_hour: { type: Number, default: 0 },
    payable_salary: { type: Number, required: true },

    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    paid_at: { type: Date, default: null },

    // 👇 NEW
    attendance_count: {
      type: Number,
      default: 0,
    },
    attendance_bonus_awarded: {
      type: Boolean,
      default: false,
    },

    transactions: [SalaryTxnSchema],
  },
  { timestamps: true }
);

export default mongoose.model("EmployeeSalary", EmployeeSalarySchema);
