// models/Attendance.js
import mongoose from "mongoose";

const AttendanceHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
    extra_note: { type: String, default: "", trim: true },
    changed_at: { type: Date, default: Date.now },
    changed_by: { type: String, default: "system" },
  },
  { _id: false }
);

const AttendanceSchema = new mongoose.Schema(
  {
    employee_id: { type: String, required: true, index: true, trim: true },
    attendance_date: { type: String, required: true, index: true, trim: true }, // YYYY-MM-DD
    status: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
    history: {
      type: [AttendanceHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// 1 record per employee per day
AttendanceSchema.index({ employee_id: 1, attendance_date: 1 }, { unique: true });

export default mongoose.model("Attendance", AttendanceSchema);
