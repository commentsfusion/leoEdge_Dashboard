import express from "express";
import {
  createOrUpdateAttendance,
  getAttendanceByEmployee,
  getAttendanceByEmployeeAndDate,
  getAttendanceByDate,
  getTodayAttendance,
  getAttendanceByEmployeeRange,   // 👈 NEW
} from "../controllers/attendance.controller.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// get attendance of a specific date for all employees (can paginate via ?page=&limit=)
router.get("/date/:date", getAttendanceByDate);

// get today's attendance (shortcut)
router.get("/today", getTodayAttendance);

// 👇 NEW: attendance of ONE employee between 2 dates ?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/range/:employee_id", getAttendanceByEmployeeRange);

// create or update attendance for a given date (past or today, not future)
router.post("/", protect, requireRole("admin"), createOrUpdateAttendance);

// get one employee's attendance for a given date
router.get("/:employee_id/:date", getAttendanceByEmployeeAndDate);

// get full attendance history of one employee (paginated)
router.get("/:employee_id", getAttendanceByEmployee);

export default router;
