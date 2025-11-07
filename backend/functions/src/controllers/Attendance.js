// src/models/Attendance.js
import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    employee_id: { type: String, required: true, index: true, trim: true },

    // let user pass any value (e.g. "Present", "Absent", "Leave", "Late", "Half Day", "Off", "Remote", etc.)
    status: { type: String, required: true, trim: true },

    note: { type: String, default: "", trim: true },

    // store date as string "YYYY-MM-DD" to make day-unique indexing easy and portable
    attendance_date: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// ensure one record per employee/day
AttendanceSchema.index({ employee_id: 1, attendance_date: 1 }, { unique: true });

export default mongoose.model("Attendance", AttendanceSchema);
