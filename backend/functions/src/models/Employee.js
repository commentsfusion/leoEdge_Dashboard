// models/Employee.js
import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    designation: { type: String, required: true, trim: true },
    phone_no: { type: String, required: true, trim: true },
    job_shift: { type: String, required: true, trim: true },
    joining_date: { type: Date, default: null },
    referred_by: { type: String, default: "", trim: true },
    salary: { type: Number, required: true },

    // computed
    salary_per_hour: {
      type: Number,
      default: 0,
    },

    current_employee: {
      type: String,
      default: "Active Employee",
      trim: true,
    },
    image: { type: String, default: "" },
    salary_count: { type: Number, default: 0 },

    // ✅ add these 3 optional banking fields
    iban_number: { type: String, default: "", trim: true },
    account_title: { type: String, default: "", trim: true },
    bank_name: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", EmployeeSchema);
