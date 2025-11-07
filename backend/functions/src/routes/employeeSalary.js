import { Router } from "express";
import {
  upsertDailySalary,
  getDailySalary,
  updateDailySalaryByEmpAndDate,
  deleteDailySalaryByEmpAndDate,
  getSalaryEvents,             // NEW
  getSalaryEventsSummary,      // NEW
} from "../controllers/salary.controller.js";

const router = Router();

// Create/Upsert (employee_id + date required)
router.post("/", upsertDailySalary);

// List records (filter by employee_id/date/month/range) OR base salary if only employee_id
router.get("/", getDailySalary);

// Audit endpoints
router.get("/events", getSalaryEvents);
router.get("/events/summary", getSalaryEventsSummary);

// Update specific day (by employee + date)
router.patch("/:employee_id/:date", updateDailySalaryByEmpAndDate);

// Delete specific day (by employee + date)
router.delete("/:employee_id/:date", deleteDailySalaryByEmpAndDate);

export default router;
